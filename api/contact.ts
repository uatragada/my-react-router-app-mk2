import { handleContactRelay } from "../server/contact-relay";

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

export default async function handler(request: NodeApiRequest, response: NodeApiResponse) {
  try {
    const result = await handleContactRelay(
      request.method,
      (await readNodePayload(request)) as Parameters<typeof handleContactRelay>[1],
      contactRelayEnv(),
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
