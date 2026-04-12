import type { PostDetail } from "./sanityContent";

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function extractBodyPreview(post: PostDetail | null) {
  if (!post?.body) {
    return [];
  }

  return post.body
    .map((block) => {
      if (!block || typeof block !== "object" || !("_type" in block) || block._type !== "block") {
        return "";
      }

      const children = "children" in block ? block.children : undefined;

      if (!Array.isArray(children)) {
        return "";
      }

      return children
        .map((child) => {
          if (!child || typeof child !== "object" || !("text" in child) || typeof child.text !== "string") {
            return "";
          }

          return child.text;
        })
        .join("")
        .trim();
    })
    .filter(Boolean)
    .slice(0, 3);
}
