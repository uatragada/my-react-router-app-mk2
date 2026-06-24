import { handleContactRelay } from "../server/contact-relay";

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

async function readPayload(request: Request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function contactRelayEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  };
}

export async function GET() {
  const result = await handleContactRelay("GET", undefined, contactRelayEnv());
  return json(result.body, result.status, result.headers);
}

export async function POST(request: Request) {
  const result = await handleContactRelay(
    request.method,
    (await readPayload(request)) as Parameters<typeof handleContactRelay>[1],
    contactRelayEnv(),
  );
  return json(result.body, result.status, result.headers);
}
