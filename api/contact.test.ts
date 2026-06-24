import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./contact";
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
});
