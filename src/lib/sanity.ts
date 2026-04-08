import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || "pwlv2v22";
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || "2026-04-08";

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
