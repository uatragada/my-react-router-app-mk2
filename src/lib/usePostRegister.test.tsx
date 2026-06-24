import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePostRegister } from "./usePostRegister";
import { getPostBySectionAndSlug, getPostPreviewsBySection } from "./sanityContent";
import type { PostDetail, PostPreview } from "./sanityContent";

vi.mock("./sanityContent", async () => {
  const actual = await vi.importActual<typeof import("./sanityContent")>("./sanityContent");

  return {
    ...actual,
    getPostPreviewsBySection: vi.fn(),
    getPostBySectionAndSlug: vi.fn(),
  };
});

const getPostPreviewsBySectionMock = vi.mocked(getPostPreviewsBySection);
const getPostBySectionAndSlugMock = vi.mocked(getPostBySectionAndSlug);

const previews: PostPreview[] = [
  {
    _id: "post-a",
    title: "Post A",
    slug: "post-a",
    section: "blog",
  },
  {
    _id: "post-b",
    title: "Post B",
    slug: "post-b",
    section: "blog",
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe("usePostRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPostPreviewsBySectionMock.mockResolvedValue(previews);
  });

  it("loads previews and selects the first post by default", async () => {
    getPostBySectionAndSlugMock.mockResolvedValue({
      ...previews[0],
      body: [],
    });

    const { result } = renderHook(() => usePostRegister("blog"));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    await waitFor(() => expect(result.current.detailStatus).toBe("ready"));

    expect(result.current.posts).toEqual(previews);
    expect(result.current.selectedSlug).toBe("post-a");
    expect(result.current.selectedPost?.slug).toBe("post-a");
  });

  it("ignores stale detail responses after a later selection wins", async () => {
    const firstPost = deferred<PostDetail | null>();
    const secondPost = deferred<PostDetail | null>();

    getPostBySectionAndSlugMock
      .mockReturnValueOnce(firstPost.promise)
      .mockReturnValueOnce(secondPost.promise);

    const { result } = renderHook(() => usePostRegister("blog"));

    await waitFor(() => expect(result.current.selectedSlug).toBe("post-a"));

    act(() => {
      result.current.selectPost("post-b");
    });

    secondPost.resolve({ ...previews[1], body: [] });

    await waitFor(() => expect(result.current.selectedPost?.slug).toBe("post-b"));

    firstPost.resolve({ ...previews[0], body: [] });

    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(result.current.selectedSlug).toBe("post-b");
    expect(result.current.selectedPost?.slug).toBe("post-b");
  });
});
