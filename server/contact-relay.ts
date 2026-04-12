const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

type ContactRelayEnv = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
};

type ContactRelayResult = {
  status: number;
  body: {
    ok?: boolean;
    error?: string;
  };
  headers?: Record<string, string>;
};

function normalize(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

export async function handleContactRelay(method: string | undefined, payload: ContactPayload | undefined, env: ContactRelayEnv): Promise<ContactRelayResult> {
  if (method !== "POST") {
    return {
      status: 405,
      headers: { Allow: "POST" },
      body: { error: "Method not allowed." },
    };
  }

  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return {
      status: 500,
      body: { error: "Contact relay is not configured yet." },
    };
  }

  const name = normalize(payload?.name);
  const email = normalize(payload?.email);
  const subject = normalize(payload?.subject);
  const message = normalize(payload?.message);

  if (!name || !email || !subject || !message) {
    return {
      status: 400,
      body: { error: "All fields are required." },
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      status: 400,
      body: { error: "Enter a valid email address." },
    };
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
    const errorPayload = (await resendResponse.json().catch(() => null)) as { message?: unknown } | null;
    const messageFromResend =
      typeof errorPayload?.message === "string"
        ? errorPayload.message
        : "Unable to route the message right now.";

    return {
      status: 502,
      body: { error: messageFromResend },
    };
  }

  return {
    status: 200,
    body: { ok: true },
  };
}
