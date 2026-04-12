import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SelectorIndicator, SystemPage, UplinkDirectory } from "../components/system-chrome";
import { extractBodyPreview, formatPostDate } from "../lib/post-viewer";
import { sanityImageUrl } from "../lib/sanity";
import { getPostBySectionAndSlug, getProjectPostPreviews, type PostDetail, type PostPreview } from "../lib/sanityContent";
import "../styles/content-console.css";

const registerFallbackCopy = "System notes and implementation details are available inside the full dossier.";

export default function Projects() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const projectPosts = await getProjectPostPreviews();
        setPosts(projectPosts);
        setSelectedSlug((currentSlug) => currentSlug ?? projectPosts[0]?.slug ?? null);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load project posts from Sanity", error);
        setStatus("error");
      }
    };

    loadPrograms();
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
        const nextPost = await getPostBySectionAndSlug("projects", selectedSlug);
        setSelectedPost(nextPost);
        setDetailStatus("ready");
      } catch (error) {
        console.error("Failed to load selected project record", error);
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
  const selectedSummary = selectedPost?.excerpt || selectedPreview?.excerpt || registerFallbackCopy;
  const selectedBodyPreview = extractBodyPreview(selectedPost);
  const selectedImage = selectedPost?.coverImage
    ? sanityImageUrl(selectedPost.coverImage, { width: 1400, height: 900, fit: "crop" })
    : null;

  return (
    <SystemPage
      pageClassName="projects-page"
      centerLabel="PROGRAM REGISTER / DOSSIER INDEX"
      metaLabel="LIVE ROUTE / VIEWER MODE"
      footerStart={`REGISTER COUNT / ${registerCount}`}
      footerEnd="MODE / DOSSIER REGISTER"
    >
      <section className="content-console-grid" aria-label="Programs console">
        <article className="content-console-identity">
          <div className="content-console-kicker">
            <span>Technical</span>
            <span>Programs</span>
            <span>Index</span>
          </div>
          <div className="content-console-title">
            <span>Programs</span>
          </div>
          <p className="content-console-summary">
            A full-register view for project dossiers, experiments, and deployed systems.
          </p>
          <div className="content-console-readouts">
            <div>
              <span>Indexed Entries</span>
              <span>{registerCount}</span>
            </div>
            <div>
              <span>Current Mode</span>
              <span>Viewer</span>
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
            Browse the active body of project work as a clean dossier index, then inspect each program in the local
            viewer without leaving the surface.
          </div>
          <div className="content-console-manifest-grid">
            <div>
              <span>Primary Route</span>
              <span>/projects</span>
            </div>
            <div>
              <span>Source Feed</span>
              <span>Sanity / Projects</span>
            </div>
            <div>
              <span>Index State</span>
              <span>{status === "ready" ? "Nominal" : status === "loading" ? "Syncing" : "Degraded"}</span>
            </div>
          </div>
        </article>

        <section className="content-console-register" aria-label="Program register">
          <div className="content-console-register-header">
            <div className="content-console-panel-heading">Program Register</div>
            <div className="content-console-register-meta">{registerCount} entries</div>
          </div>

          <div className="content-console-register-body">
            {status === "loading" && (
              <div className="content-console-message" role="status">
                Synchronizing program index...
              </div>
            )}

            {status === "error" && <div className="content-console-message">Program register unavailable right now.</div>}

            {status === "ready" && posts.length === 0 && (
              <div className="content-console-message">No program dossiers are currently published.</div>
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
                  <span className="content-console-entry-id">PRG-{String(index + 1).padStart(2, "0")}</span>
                  <div className="content-console-entry-copy">
                    <div className="content-console-entry-topline">
                      <span className="content-console-entry-title">{post.title}</span>
                      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
                    </div>
                    <p>{post.excerpt || registerFallbackCopy}</p>
                  </div>
                  <SelectorIndicator />
                </button>
              ))}
          </div>

          <div className="content-console-register-footer">SELECT A DOSSIER TO LOAD ITS BRIEF INTO THE VIEWER BAY.</div>
        </section>

        <div className="content-console-navwrap">
          <UplinkDirectory />

          <aside className="content-console-signals" aria-label="Programs status summary">
            <div className="content-console-panel-heading">Index Signals</div>
            <div className="content-console-signal-list">
              <ReadoutRow label="Route Status" value="Live route" />
              <ReadoutRow label="Latest Publish" value={latestLabel} />
              <ReadoutRow label="Focus Window" value={featuredTitles.length > 0 ? `${featuredTitles.length} entries` : "Awaiting sync"} />
              <ReadoutRow label="Viewer Bus" value={detailStatus === "ready" ? "Locked" : "Syncing"} />
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
                <div className="content-console-feature-empty">Featured slots populate from the live project feed.</div>
              )}
            </div>
          </aside>
        </div>

        <article className="content-console-viewer" aria-label="Selected program dossier">
          <div className="content-console-viewer-header">
            <div className="content-console-panel-heading">Viewer Bay</div>
            <div className="content-console-viewer-meta">
              {selectedPreview ? `PRG / ${selectedPreview.slug.toUpperCase()}` : "Awaiting selection"}
            </div>
          </div>

          {detailStatus === "error" && (
            <div className="content-console-viewer-empty">Selected dossier is unavailable right now.</div>
          )}

          {detailStatus === "idle" && !selectedPreview && (
            <div className="content-console-viewer-empty">Select a program entry to open the local brief.</div>
          )}

          {selectedPreview && detailStatus !== "error" && (
            <div className="content-console-viewer-body">
              <div className="content-console-viewer-copy">
                <div className="content-console-viewer-titleblock">
                  <div className="content-console-viewer-title">{selectedPreview.title}</div>
                  <div className="content-console-viewer-subline">
                    <span>{selectedPreview.publishedAt ? formatPostDate(selectedPreview.publishedAt) : "Undated"}</span>
                    <span>{detailStatus === "loading" ? "Syncing dossier" : "Local brief loaded"}</span>
                  </div>
                </div>

                <p className="content-console-viewer-summary">{selectedSummary}</p>

                <div className="content-console-viewer-readouts">
                  <ReadoutRow label="Canonical Route" value={`/projects/${selectedPreview.slug}`} />
                  <ReadoutRow label="Section" value="Programs" />
                  <ReadoutRow label="Body Blocks" value={selectedPost?.body ? String(selectedPost.body.length).padStart(2, "0") : "No data"} />
                  <ReadoutRow label="Viewer Status" value={detailStatus === "ready" ? "Loaded" : "Syncing"} />
                </div>

                <div className="content-console-viewer-text">
                  {selectedBodyPreview.length > 0 ? (
                    selectedBodyPreview.map((paragraph, index) => <p key={`${selectedPreview._id}-${index}`}>{paragraph}</p>)
                  ) : (
                    <p>Full narrative blocks will appear here once the published dossier includes body copy.</p>
                  )}
                </div>

                <div className="content-console-viewer-actions">
                  <Link to={`/projects/${selectedPreview.slug}`} className="content-console-inline-link">
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
                    <div className="content-console-viewer-plate-title">Program Plate</div>
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
