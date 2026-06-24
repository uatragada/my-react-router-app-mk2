import { handleSanityRelay } from "../server/sanity-relay";

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

function sanityRelayEnv() {
  return {
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION,
    VITE_SANITY_PROJECT_ID: process.env.VITE_SANITY_PROJECT_ID,
    VITE_SANITY_DATASET: process.env.VITE_SANITY_DATASET,
    VITE_SANITY_API_VERSION: process.env.VITE_SANITY_API_VERSION,
  };
}

export async function GET() {
  const result = await handleSanityRelay("GET", undefined, sanityRelayEnv());
  return json(result.body, result.status, result.headers);
}

export async function POST(request: Request) {
  const result = await handleSanityRelay(
    request.method,
    (await readPayload(request)) as Parameters<typeof handleSanityRelay>[1],
    sanityRelayEnv(),
  );
  return json(result.body, result.status, result.headers);
}
