import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./sanity-query";
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
});
