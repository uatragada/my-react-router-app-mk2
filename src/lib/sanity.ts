import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || "pwlv2v22";
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || "2026-04-08";
const sanityQueryEndpoint = "/api/sanity-query";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];

type SanityImageUrlOptions = {
  width?: number;
  height?: number;
  fit?: "crop" | "max";
};

export function sanityImageUrl(source: SanityImageSource, options: SanityImageUrlOptions = {}): string {
  const { width = 1200, height, fit = "max" } = options;
  let image = builder.image(source).width(width).auto("format").fit(fit);

  if (height) {
    image = image.height(height);
  }

  return image.url();
}

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  if (typeof window === "undefined") {
    return sanityClient.fetch<T>(query, params);
  }

  const response = await fetch(sanityQueryEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, params }),
  });

  const payload = (await response.json().catch(() => null)) as { result?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Unable to reach the content registry right now.");
  }

  return payload?.result as T;
}
