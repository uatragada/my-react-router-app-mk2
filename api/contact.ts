import { handleContactRelay } from "../server/contact-relay";

type ContactRequest = {
  method?: string;
  body?: {
    name?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
  };
};

type ContactResponse = {
  status: (code: number) => ContactResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

function json(res: ContactResponse, status: number, body: unknown) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

export default async function handler(req: ContactRequest, res: ContactResponse) {
  const result = await handleContactRelay(req.method, req.body, {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  });

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  return json(res, result.status, result.body);
}
