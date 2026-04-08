import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPostBySectionAndSlug,
  type PostDetail,
  type PostSection,
  type SanityImage,
} from "../lib/sanityContent";
import { sanityImageUrl } from "../lib/sanity";
import "../styles/ai-pong-play.css";

type PostDetailPageProps = {
  section: PostSection;
  basePath: "/blog" | "/projects";
  backLabel: string;
};

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote className="italic">{children}</blockquote>,
  },
  types: {
    image: ({ value }) => {
      const image = value as SanityImage & { alt?: string };

      return (
        <img
          src={sanityImageUrl(image, { width: 1200 })}
          alt={image.alt || ""}
          className="w-full"
          loading="lazy"
        />
      );
    },
  },
};

export default function PostDetailPage({ section, basePath, backLabel }: PostDetailPageProps) {
  const { slug } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("error");
      return;
    }

    const loadPost = async () => {
      try {
        const nextPost = await getPostBySectionAndSlug(section, slug);
        setPost(nextPost);
        setStatus("ready");
      } catch (error) {
        console.error(`Failed to load ${section} post from Sanity`, error);
        setStatus("error");
      }
    };

    loadPost();
  }, [section, slug]);

  return (
    <main className="post-container flex items-center justify-center pt-32 pb-4">
      <article className="post-detail-article w-[800px] max-w-[90vw] space-y-6">
        <Link to={basePath} className="post-back-link">
          Back to {backLabel}
        </Link>
        {status === "loading" && <p className="post-status-panel">Loading post...</p>}
        {status === "error" && <p className="post-status-panel">Post is unavailable right now.</p>}
        {status === "ready" && !post && <p className="post-status-panel">Post not found.</p>}
        {post && (
          <>
            <header className="page-header post-detail-title-section">
              <h1>{post.title}</h1>
            </header>
            <section className="post-detail-body-section space-y-6">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              {post.excerpt && <p className="italic">{post.excerpt}</p>}
              {post.coverImage && (
                <img
                  src={sanityImageUrl(post.coverImage, { width: 1200 })}
                  alt={post.coverImageAlt || ""}
                  className="w-full"
                  loading="lazy"
                />
              )}
              {section === "projects" && post.slug === "ai-pong-self-play" && (
                <Link to="/projects/ai-pong-self-play/play" className="project-play-link">
                  Play against the trained bot
                </Link>
              )}
              {post.body && post.body.length > 0 && (
                <div className="post-body-content space-y-4">
                  <PortableText value={post.body} components={portableTextComponents} />
                </div>
              )}
            </section>
          </>
        )}
      </article>
    </main>
  );
}
