const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function normalize(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

async function readPayload(request: Request): Promise<ContactPayload | null> {
  try {
    return (await request.json()) as ContactPayload;
  } catch {
    return null;
  }
}

function getRuntimeConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  };
}

export function GET() {
  return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
}

export async function POST(request: Request) {
  try {
    const { apiKey, to, from } = getRuntimeConfig();

    if (!apiKey || !to || !from) {
      return json({ error: "Contact relay is not configured yet." }, 500);
    }

    const payload = await readPayload(request);

    if (!payload) {
      return json({ error: "Invalid JSON payload." }, 400);
    }

    const name = normalize(payload.name);
    const email = normalize(payload.email);
    const subject = normalize(payload.subject);
    const message = normalize(payload.message);

    if (!name || !email || !subject || !message) {
      return json({ error: "All fields are required." }, 400);
    }

    if (!EMAIL_PATTERN.test(email)) {
      return json({ error: "Enter a valid email address." }, 400);
    }

    const text = [
      "Portfolio contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio Contact / ${subject}`,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const rawError = await resendResponse.text();
      let errorMessage = "Unable to route the message right now.";

      if (rawError) {
        try {
          const parsed = JSON.parse(rawError) as { message?: unknown; error?: unknown };
          errorMessage =
            typeof parsed.message === "string"
              ? parsed.message
              : typeof parsed.error === "string"
                ? parsed.error
                : rawError;
        } catch {
          errorMessage = rawError;
        }
      }

      return json({ error: errorMessage }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unexpected relay failure.";
    return json({ error: message }, 500);
  }
}
