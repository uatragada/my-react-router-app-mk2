import { handleSanityRelay } from "../server/sanity-relay";

type SanityRequest = {
  method?: string;
  body?: {
    query?: unknown;
    params?: unknown;
  };
};

type SanityResponse = {
  status: (code: number) => SanityResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

function json(res: SanityResponse, status: number, body: unknown) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

export default async function handler(req: SanityRequest, res: SanityResponse) {
  const result = await handleSanityRelay(req.method, req.body, process.env);

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  return json(res, result.status, result.body);
}
