import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPostBySectionAndSlug,
  type PostDetail,
  type PostSection,
  type SanityImage,
} from "../lib/sanityContent";
import { SystemPage, UplinkDirectory } from "../components/system-chrome";
import { formatPostDate } from "../lib/post-viewer";
import { sanityImageUrl } from "../lib/sanity";
import "../styles/post-detail.css";

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
    <SystemPage
      pageClassName="post-record-page"
      centerLabel={`${section.toUpperCase()} DOSSIER / FULL RECORD`}
      metaLabel="LIVE ROUTE / DETAIL MODE"
      footerStart={`RETURN / ${backLabel.toUpperCase()}`}
      footerEnd="MODE / DETAIL RECORD"
    >
      <section className="post-record-layout" aria-label="Post detail layout">
        <aside className="post-record-sidebar">
          <div className="post-record-sidebar-top">
            <Link to={basePath} className="post-record-back-link">
              Back to {backLabel}
            </Link>
            <div className="post-record-sidebar-readouts">
              <div>
                <span>Section</span>
                <span>{section}</span>
              </div>
              <div>
                <span>Status</span>
                <span>{status === "ready" ? "Loaded" : status === "loading" ? "Syncing" : "Error"}</span>
              </div>
              <div>
                <span>Slug</span>
                <span>{slug || "Unknown"}</span>
              </div>
            </div>
          </div>

          <div className="post-record-sidebar-nav">
            <UplinkDirectory />
          </div>
        </aside>

        <article className="post-record-main">
          {status === "loading" && <div className="post-record-message">Loading post...</div>}
          {status === "error" && <div className="post-record-message">Post is unavailable right now.</div>}
          {status === "ready" && !post && <div className="post-record-message">Post not found.</div>}
          {post && (
            <div className="post-record-article">
              <header className="post-record-header">
                <div className="post-record-kicker">{section === "projects" ? "Program Dossier" : "Transmission Record"}</div>
                <h1>{post.title}</h1>
                <div className="post-record-meta">
                  <span>{post.publishedAt ? formatPostDate(post.publishedAt) : "Undated"}</span>
                  <span>{slug}</span>
                </div>
                {post.excerpt && <p className="post-record-excerpt">{post.excerpt}</p>}
              </header>

              {post.coverImage && (
                <div className="post-record-cover">
                  <img src={sanityImageUrl(post.coverImage, { width: 1600 })} alt={post.coverImageAlt || ""} loading="lazy" />
                </div>
              )}

              {section === "projects" && post.slug === "ai-pong-self-play" && (
                <Link to="/projects/ai-pong-self-play/play" className="post-record-inline-link">
                  Play against the trained bot
                </Link>
              )}

              {post.body && post.body.length > 0 ? (
                <div className="post-record-body">
                  <PortableText value={post.body} components={portableTextComponents} />
                </div>
              ) : (
                <div className="post-record-body">
                  <p>No long-form body has been published for this entry yet.</p>
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </SystemPage>
  );
}
