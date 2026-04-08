import { sanityClient, sanityImageUrl } from "./sanity";

type SanityImage = Parameters<typeof sanityImageUrl>[0];
export type PostSection = "blog" | "projects";

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

export type PostPreview = {
  _id: string;
  title: string;
  slug: string;
  section?: PostSection;
  excerpt?: string;
  publishedAt?: string;
  coverImage?: SanityImage;
  coverImageAlt?: string;
};
export type BlogPostPreview = PostPreview;

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

const postPreviewBySectionQuery = `*[_type == "post" && defined(slug.current) && (
  section == $section || ($section == "blog" && !defined(section))
)] | order(publishedAt desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  section,
  excerpt,
  publishedAt,
  coverImage,
  "coverImageAlt": coverImage.alt
}`;

export async function getPhotos(): Promise<Photo[]> {
  return sanityClient.fetch<Photo[]>(photoQuery);
}

export async function getPostPreviewsBySection(section: PostSection): Promise<PostPreview[]> {
  return sanityClient.fetch<PostPreview[]>(postPreviewBySectionQuery, { section });
}

export async function getBlogPostPreviews(): Promise<PostPreview[]> {
  return getPostPreviewsBySection("blog");
}

export async function getProjectPostPreviews(): Promise<PostPreview[]> {
  return getPostPreviewsBySection("projects");
}
