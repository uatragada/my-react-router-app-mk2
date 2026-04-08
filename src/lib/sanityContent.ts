import { sanityClient, sanityImageUrl } from "./sanity";

type SanityImage = Parameters<typeof sanityImageUrl>[0];

export type Photo = {
  _id: string;
  title?: string;
  alt?: string;
  caption?: string;
  image: SanityImage;
  originalUrl?: string;
  width?: number;
  height?: number;
};

export type BlogPostPreview = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  coverImage?: SanityImage;
  coverImageAlt?: string;
};

const photoQuery = `*[_type == "photo"] | order(coalesce(sortOrder, 9999) asc, _createdAt desc) {
  _id,
  title,
  "alt": image.alt,
  caption,
  image,
  "originalUrl": image.asset->url,
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height
}`;

const blogPostPreviewQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage,
  "coverImageAlt": coverImage.alt
}`;

export async function getPhotos(): Promise<Photo[]> {
  return sanityClient.fetch<Photo[]>(photoQuery);
}

export async function getBlogPostPreviews(): Promise<BlogPostPreview[]> {
  return sanityClient.fetch<BlogPostPreview[]>(blogPostPreviewQuery);
}
