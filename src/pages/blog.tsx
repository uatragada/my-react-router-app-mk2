import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SelectorIndicator, SystemPage, UplinkDirectory } from "../components/system-chrome";
import { extractBodyPreview, formatPostDate } from "../lib/post-viewer";
import { sanityImageUrl } from "../lib/sanity";
import { getBlogPostPreviews, getPostBySectionAndSlug, type PostDetail, type PostPreview } from "../lib/sanityContent";
import "../styles/content-console.css";

const transmissionFallbackCopy = "Transmission summary is pending publication in the long-form entry.";

export default function Blog() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postPreviews = await getBlogPostPreviews();
        setPosts(postPreviews);
        setSelectedSlug((currentSlug) => currentSlug ?? postPreviews[0]?.slug ?? null);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load blog posts from Sanity", error);
        setStatus("error");
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setSelectedPost(null);
      setDetailStatus("idle");
      return;
    }

    const loadSelectedPost = async () => {
      try {
        setDetailStatus("loading");
        const nextPost = await getPostBySectionAndSlug("blog", selectedSlug);
        setSelectedPost(nextPost);
        setDetailStatus("ready");
      } catch (error) {
        console.error("Failed to load selected communication record", error);
        setSelectedPost(null);
        setDetailStatus("error");
      }
    };

    loadSelectedPost();
  }, [selectedSlug]);

  const registerCount = posts.length.toString().padStart(3, "0");
  const latestPublishedAt = posts.find((post) => post.publishedAt)?.publishedAt;
  const latestLabel = latestPublishedAt ? formatPostDate(latestPublishedAt) : "No sync";
  const featuredTitles = posts.slice(0, 3);
  const selectedPreview = posts.find((post) => post.slug === selectedSlug) ?? null;
  const selectedSummary = selectedPost?.excerpt || selectedPreview?.excerpt || transmissionFallbackCopy;
  const selectedBodyPreview = extractBodyPreview(selectedPost);
  const selectedImage = selectedPost?.coverImage
    ? sanityImageUrl(selectedPost.coverImage, { width: 1400, height: 900, fit: "crop" })
    : null;

  return (
    <SystemPage
      pageClassName="blog-page"
      centerLabel="COMMUNICATIONS INDEX / TRANSMISSION LOG"
      metaLabel="LIVE ROUTE / READER MODE"
      footerStart={`ENTRY COUNT / ${registerCount}`}
      footerEnd="MODE / TRANSMISSION REGISTER"
    >
      <section className="content-console-grid" aria-label="Communications console">
        <article className="content-console-identity">
          <div className="content-console-kicker">
            <span>Field</span>
            <span>Notes</span>
            <span>Index</span>
          </div>
          <div className="content-console-title">
            <span>Communications</span>
          </div>
          <p className="content-console-summary">
            Short-form writeups, engineering notes, and public-facing transmissions tied to the work on this site.
          </p>
          <div className="content-console-readouts">
            <div>
              <span>Published Entries</span>
              <span>{registerCount}</span>
            </div>
            <div>
              <span>Current Mode</span>
              <span>Reader</span>
            </div>
            <div>
              <span>Last Publish</span>
              <span>{latestLabel}</span>
            </div>
          </div>
        </article>

        <article className="content-console-manifest">
          <div className="content-console-panel-heading">Section Scope</div>
          <div className="content-console-manifest-copy">
            A live register for writing, update notes, and technical reflections. Select an entry to inspect the brief
            locally, then open the full post when you want the full thread.
          </div>
          <div className="content-console-manifest-grid">
            <div>
              <span>Primary Route</span>
              <span>/blog</span>
            </div>
            <div>
              <span>Source Feed</span>
              <span>Sanity / Blog</span>
            </div>
            <div>
              <span>Channel State</span>
              <span>{status === "ready" ? "Nominal" : status === "loading" ? "Syncing" : "Degraded"}</span>
            </div>
          </div>
        </article>

        <section className="content-console-register" aria-label="Communications register">
          <div className="content-console-register-header">
            <div className="content-console-panel-heading">Transmission Register</div>
            <div className="content-console-register-meta">{registerCount} entries</div>
          </div>

          <div className="content-console-register-body">
            {status === "loading" && (
              <div className="content-console-message" role="status">
                Synchronizing communication log...
              </div>
            )}

            {status === "error" && <div className="content-console-message">Communications are unavailable right now.</div>}

            {status === "ready" && posts.length === 0 && (
              <div className="content-console-message">No transmissions are currently published.</div>
            )}

            {status === "ready" &&
              posts.map((post, index) => (
                <button
                  key={post._id}
                  type="button"
                  className={`content-console-entry${selectedSlug === post.slug ? " is-selected" : ""}`}
                  onClick={() => setSelectedSlug(post.slug)}
                  aria-pressed={selectedSlug === post.slug}
                >
                  <span className="content-console-entry-id">COM-{String(index + 1).padStart(2, "0")}</span>
                  <div className="content-console-entry-copy">
                    <div className="content-console-entry-topline">
                      <span className="content-console-entry-title">{post.title}</span>
                      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
                    </div>
                    <p>{post.excerpt || transmissionFallbackCopy}</p>
                  </div>
                  <SelectorIndicator />
                </button>
              ))}
          </div>

          <div className="content-console-register-footer">SELECT A TRANSMISSION TO LOAD ITS BRIEF INTO THE READER BAY.</div>
        </section>

        <div className="content-console-navwrap">
          <UplinkDirectory />

          <aside className="content-console-signals" aria-label="Communications status summary">
            <div className="content-console-panel-heading">Channel Signals</div>
            <div className="content-console-signal-list">
              <ReadoutRow label="Route Status" value="Live route" />
              <ReadoutRow label="Latest Publish" value={latestLabel} />
              <ReadoutRow label="Open Window" value={featuredTitles.length > 0 ? `${featuredTitles.length} visible` : "Awaiting sync"} />
              <ReadoutRow label="Reader Bus" value={detailStatus === "ready" ? "Locked" : "Syncing"} />
            </div>
            <div className="content-console-feature-list">
              {featuredTitles.length > 0 ? (
                featuredTitles.map((post, index) => (
                  <div key={post._id} className="content-console-feature-item">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{post.title}</span>
                  </div>
                ))
              ) : (
                <div className="content-console-feature-empty">Featured slots populate from the live blog feed.</div>
              )}
            </div>
          </aside>
        </div>

        <article className="content-console-viewer" aria-label="Selected communication dossier">
          <div className="content-console-viewer-header">
            <div className="content-console-panel-heading">Reader Bay</div>
            <div className="content-console-viewer-meta">
              {selectedPreview ? `COM / ${selectedPreview.slug.toUpperCase()}` : "Awaiting selection"}
            </div>
          </div>

          {detailStatus === "error" && (
            <div className="content-console-viewer-empty">Selected transmission is unavailable right now.</div>
          )}

          {detailStatus === "idle" && !selectedPreview && (
            <div className="content-console-viewer-empty">Select a transmission to open the local brief.</div>
          )}

          {selectedPreview && detailStatus !== "error" && (
            <div className="content-console-viewer-body">
              <div className="content-console-viewer-copy">
                <div className="content-console-viewer-titleblock">
                  <div className="content-console-viewer-title">{selectedPreview.title}</div>
                  <div className="content-console-viewer-subline">
                    <span>{selectedPreview.publishedAt ? formatPostDate(selectedPreview.publishedAt) : "Undated"}</span>
                    <span>{detailStatus === "loading" ? "Syncing transmission" : "Local brief loaded"}</span>
                  </div>
                </div>

                <p className="content-console-viewer-summary">{selectedSummary}</p>

                <div className="content-console-viewer-readouts">
                  <ReadoutRow label="Canonical Route" value={`/blog/${selectedPreview.slug}`} />
                  <ReadoutRow label="Section" value="Communications" />
                  <ReadoutRow label="Body Blocks" value={selectedPost?.body ? String(selectedPost.body.length).padStart(2, "0") : "No data"} />
                  <ReadoutRow label="Reader Status" value={detailStatus === "ready" ? "Loaded" : "Syncing"} />
                </div>

                <div className="content-console-viewer-text">
                  {selectedBodyPreview.length > 0 ? (
                    selectedBodyPreview.map((paragraph, index) => <p key={`${selectedPreview._id}-${index}`}>{paragraph}</p>)
                  ) : (
                    <p>Full narrative blocks will appear here once the published entry includes body copy.</p>
                  )}
                </div>

                <div className="content-console-viewer-actions">
                  <Link to={`/blog/${selectedPreview.slug}`} className="content-console-inline-link">
                    Open full record
                  </Link>
                </div>
              </div>

              <div className="content-console-viewer-media">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={selectedPost?.coverImageAlt || selectedPreview.title}
                    className="content-console-viewer-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="content-console-viewer-plate">
                    <div className="content-console-viewer-plate-title">Transmission Plate</div>
                    <div className="content-console-viewer-plate-code">{selectedPreview.slug.toUpperCase()}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </section>
    </SystemPage>
  );
}

function ReadoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="content-console-readout-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
