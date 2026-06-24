import { beforeEach, describe, expect, it, vi } from "vitest";
import handler, { POST } from "./contact";
import { handleContactRelay } from "../server/contact-relay";

vi.mock("../server/contact-relay", () => ({
  handleContactRelay: vi.fn(),
}));

const handleContactRelayMock = vi.mocked(handleContactRelay);

describe("api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates POST requests to the shared contact relay", async () => {
    handleContactRelayMock.mockResolvedValue({
      status: 200,
      body: { ok: true },
    });

    const request = new Request("https://example.test/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Uday" }),
    });
    const response = await POST(request);

    expect(handleContactRelayMock).toHaveBeenCalledWith(
      "POST",
      { name: "Uday" },
      expect.objectContaining({
        RESEND_API_KEY: undefined,
        CONTACT_TO_EMAIL: undefined,
        CONTACT_FROM_EMAIL: undefined,
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("supports the default Vercel function handler", async () => {
    handleContactRelayMock.mockResolvedValue({
      status: 200,
      body: { ok: true },
    });

    const response = {
      statusCode: 0,
      body: undefined as unknown,
      status(statusCode: number) {
        this.statusCode = statusCode;
        return this;
      },
      setHeader: vi.fn(),
      json(body: unknown) {
        this.body = body;
      },
    };

    await handler(
      {
        method: "POST",
        body: { name: "Uday" },
      },
      response,
    );

    expect(handleContactRelayMock).toHaveBeenCalledWith("POST", { name: "Uday" }, expect.any(Object));
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
