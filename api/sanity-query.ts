type SanityPayload = {
  query?: unknown;
  params?: unknown;
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

function normalizeQuery(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readPayload(request: Request): Promise<SanityPayload | null> {
  try {
    return (await request.json()) as SanityPayload;
  } catch {
    return null;
  }
}

function buildSanityQueryUrl(query: string, params: Record<string, unknown>) {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "pwlv2v22";
  const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
  const apiVersion = process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || "2026-04-08";
  const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`);

  url.searchParams.set("query", query);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  return url;
}

export function GET() {
  return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
}

export async function POST(request: Request) {
  try {
    const payload = await readPayload(request);

    if (!payload) {
      return json({ error: "Invalid JSON payload." }, 400);
    }

    const query = normalizeQuery(payload.query);

    if (!query) {
      return json({ error: "A GROQ query is required." }, 400);
    }

    const params = isPlainRecord(payload.params) ? payload.params : {};
    const response = await fetch(buildSanityQueryUrl(query, params), {
      headers: {
        Accept: "application/json",
      },
    });

    const rawBody = await response.text();
    let parsedBody: { result?: unknown; error?: unknown; message?: unknown } | null = null;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody) as { result?: unknown; error?: unknown; message?: unknown };
      } catch {
        parsedBody = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        typeof parsedBody?.error === "string"
          ? parsedBody.error
          : typeof parsedBody?.message === "string"
            ? parsedBody.message
            : "Unable to reach the content registry right now.";

      return json({ error: errorMessage }, 502);
    }

    return json(
      { result: parsedBody?.result ?? null },
      200,
      { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    );
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unexpected content relay failure.";
    return json({ error: message }, 500);
  }
}
