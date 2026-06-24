import { handleSanityRelay } from "../server/sanity-relay";

type NodeApiRequest = {
  method?: string;
  body?: unknown;
  on?: (event: "data" | "end" | "error", callback: (value?: unknown) => void) => void;
};

type NodeApiResponse = {
  status: (statusCode: number) => NodeApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
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

async function readPayload(request: Request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

async function readNodePayload(request: NodeApiRequest) {
  if (request.body !== undefined) {
    return typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  }

  if (!request.on) {
    return undefined;
  }

  const chunks: Buffer[] = [];

  return await new Promise<unknown>((resolve, reject) => {
    request.on?.("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    request.on?.("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Invalid JSON payload."));
      }
    });
    request.on?.("error", reject);
  });
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

export default async function handler(request: NodeApiRequest, response: NodeApiResponse) {
  try {
    const result = await handleSanityRelay(
      request.method,
      (await readNodePayload(request)) as Parameters<typeof handleSanityRelay>[1],
      sanityRelayEnv(),
    );

    if (result.headers) {
      for (const [name, value] of Object.entries(result.headers)) {
        response.setHeader(name, value);
      }
    }

    response.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error && error.message === "Invalid JSON payload."
      ? error.message
      : "Unable to read request payload.";

    response.status(400).json({ error: message });
  }
}
