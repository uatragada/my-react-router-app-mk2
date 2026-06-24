import { beforeEach, describe, expect, it, vi } from "vitest";
import handler, { POST } from "./sanity-query";
import { handleSanityRelay } from "../server/sanity-relay";

vi.mock("../server/sanity-relay", () => ({
  handleSanityRelay: vi.fn(),
}));

const handleSanityRelayMock = vi.mocked(handleSanityRelay);

describe("api/sanity-query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates POST requests to the shared Sanity relay", async () => {
    handleSanityRelayMock.mockResolvedValue({
      status: 200,
      body: { result: [{ _id: "a" }] },
      headers: { "Cache-Control": "public, max-age=60" },
    });

    const request = new Request("https://example.test/api/sanity-query", {
      method: "POST",
      body: JSON.stringify({ query: "*[]", params: { section: "blog" } }),
    });
    const response = await POST(request);

    expect(handleSanityRelayMock).toHaveBeenCalledWith(
      "POST",
      { query: "*[]", params: { section: "blog" } },
      expect.objectContaining({
        SANITY_PROJECT_ID: undefined,
        SANITY_DATASET: undefined,
        SANITY_API_VERSION: undefined,
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
    await expect(response.json()).resolves.toEqual({ result: [{ _id: "a" }] });
  });

  it("supports the default Vercel function handler", async () => {
    handleSanityRelayMock.mockResolvedValue({
      status: 200,
      body: { result: [{ _id: "a" }] },
      headers: { "Cache-Control": "public, max-age=60" },
    });

    const responseHeaders = new Map<string, string>();
    const response = {
      statusCode: 0,
      body: undefined as unknown,
      status(statusCode: number) {
        this.statusCode = statusCode;
        return this;
      },
      setHeader(name: string, value: string) {
        responseHeaders.set(name, value);
      },
      json(body: unknown) {
        this.body = body;
      },
    };

    await handler(
      {
        method: "POST",
        body: { query: "*[]", params: { section: "projects" } },
      },
      response,
    );

    expect(handleSanityRelayMock).toHaveBeenCalledWith(
      "POST",
      { query: "*[]", params: { section: "projects" } },
      expect.any(Object),
    );
    expect(response.statusCode).toBe(200);
    expect(responseHeaders.get("Cache-Control")).toBe("public, max-age=60");
    expect(response.body).toEqual({ result: [{ _id: "a" }] });
  });
});
