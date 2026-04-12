import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleContactRelay } from "./server/contact-relay";
import { handleSanityRelay } from "./server/sanity-relay";

type RelayResult = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

async function readJsonBody(request: IncomingMessage) {
  const chunks: Uint8Array[] = [];

  return await new Promise<unknown>((resolve, reject) => {
    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
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

    request.on("error", reject);
  });
}

function attachJsonRelay(
  server: {
    middlewares: {
      use: (
        handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
      ) => void;
    };
  },
  path: string,
  handler: (method: string | undefined, body: unknown, env: Record<string, string | undefined>) => Promise<RelayResult>,
  env: Record<string, string | undefined>,
) {
  server.middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith(path)) {
      next();
      return;
    }

    try {
      const body = await readJsonBody(req);
      const result = await handler(req.method, body, env);

      res.statusCode = result.status;
      res.setHeader("Content-Type", "application/json");

      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, value);
        }
      }

      res.end(JSON.stringify(result.body));
    } catch (error) {
      const message =
        error instanceof Error && error.message === "Invalid JSON payload."
          ? error.message
          : "Unable to read request payload.";

      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: message }));
    }
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      svgr(),
      {
        name: "relay-dev-middleware",
        configureServer(server) {
          attachJsonRelay(
            server,
            "/api/contact",
            (method, body, relayEnv) =>
              handleContactRelay(method, body as Parameters<typeof handleContactRelay>[1], {
                RESEND_API_KEY: relayEnv.RESEND_API_KEY,
                CONTACT_TO_EMAIL: relayEnv.CONTACT_TO_EMAIL,
                CONTACT_FROM_EMAIL: relayEnv.CONTACT_FROM_EMAIL,
              }),
            env,
          );

          attachJsonRelay(
            server,
            "/api/sanity-query",
            (method, body, relayEnv) => handleSanityRelay(method, body as Parameters<typeof handleSanityRelay>[1], relayEnv),
            env,
          );
        },
      },
    ],
  };
});
