import { createClient } from "@sanity/client";

type SanityQueryPayload = {
  query?: unknown;
  params?: unknown;
};

type SanityRelayEnv = {
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_VERSION?: string;
  VITE_SANITY_PROJECT_ID?: string;
  VITE_SANITY_DATASET?: string;
  VITE_SANITY_API_VERSION?: string;
};

type SanityRelayResult = {
  status: number;
  body: {
    result?: unknown;
    error?: string;
  };
  headers?: Record<string, string>;
};

function normalizeString(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function handleSanityRelay(
  method: string | undefined,
  payload: SanityQueryPayload | undefined,
  env: SanityRelayEnv,
): Promise<SanityRelayResult> {
  if (method !== "POST") {
    return {
      status: 405,
      headers: { Allow: "POST" },
      body: { error: "Method not allowed." },
    };
  }

  const query = normalizeString(payload?.query);

  if (!query) {
    return {
      status: 400,
      body: { error: "A GROQ query is required." },
    };
  }

  const client = createClient({
    projectId: env.SANITY_PROJECT_ID || env.VITE_SANITY_PROJECT_ID || "pwlv2v22",
    dataset: env.SANITY_DATASET || env.VITE_SANITY_DATASET || "production",
    apiVersion: env.SANITY_API_VERSION || env.VITE_SANITY_API_VERSION || "2026-04-08",
    useCdn: true,
    perspective: "published",
  });

  try {
    const result = await client.fetch(query, isPlainRecord(payload?.params) ? payload.params : {});

    return {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
      body: { result },
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Unable to reach the content registry right now.";

    return {
      status: 502,
      body: { error: message },
    };
  }
}
