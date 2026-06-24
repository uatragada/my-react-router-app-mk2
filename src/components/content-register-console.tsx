import { Link } from "react-router-dom";
import { SelectorIndicator, SystemPage, UplinkDirectory } from "./system-chrome";
import { extractBodyPreview, formatPostDate } from "../lib/post-viewer";
import { sanityImageUrl } from "../lib/sanity";
import { usePostRegister } from "../lib/usePostRegister";
import type { PostSection } from "../lib/sanityContent";
import "../styles/content-console.css";

type ContentRegisterCopy = {
  pageClassName: string;
  centerLabel: string;
  metaLabel: string;
  footerCountLabel: string;
  footerEnd: string;
  gridLabel: string;
  kicker: [string, string, string];
  title: string;
  summary: string;
  countLabel: string;
  modeLabel: string;
  modeValue: string;
  scopeCopy: string;
  primaryRoute: string;
  sourceFeed: string;
  stateLabel: string;
  registerLabel: string;
  registerMetaLabel: string;
  loadingMessage: string;
  errorMessage: string;
  emptyMessage: string;
  entryPrefix: string;
  registerFooter: string;
  signalsLabel: string;
  signalsHeading: string;
  windowLabel: string;
  windowReadySuffix: string;
  busLabel: string;
  busReady: string;
  busLoading: string;
  featureEmpty: string;
  viewerLabel: string;
  viewerHeading: string;
  viewerMetaPrefix: string;
  detailErrorMessage: string;
  idleMessage: string;
  selectedLoadingLabel: string;
  selectedReadyLabel: string;
  canonicalSectionLabel: string;
  bodyBlocksEmpty: string;
  fallbackCopy: string;
  bodyFallback: string;
  plateTitle: string;
};

type ContentRegisterConsoleProps = {
  section: PostSection;
  copy: ContentRegisterCopy;
};

export function ContentRegisterConsole({ section, copy }: ContentRegisterConsoleProps) {
  const { posts, status, selectedSlug, selectedPost, detailStatus, selectPost } = usePostRegister(section);
  const registerCount = posts.length.toString().padStart(3, "0");
  const latestPublishedAt = posts.find((post) => post.publishedAt)?.publishedAt;
  const latestLabel = latestPublishedAt ? formatPostDate(latestPublishedAt) : "No sync";
  const featuredTitles = posts.slice(0, 3);
  const selectedPreview = posts.find((post) => post.slug === selectedSlug) ?? null;
  const selectedSummary = selectedPost?.excerpt || selectedPreview?.excerpt || copy.fallbackCopy;
  const selectedBodyPreview = extractBodyPreview(selectedPost);
  const selectedImage = selectedPost?.coverImage
    ? sanityImageUrl(selectedPost.coverImage, { width: 1400, height: 900, fit: "crop" })
    : null;

  return (
    <SystemPage
      pageClassName={copy.pageClassName}
      centerLabel={copy.centerLabel}
      metaLabel={copy.metaLabel}
      footerStart={`${copy.footerCountLabel} / ${registerCount}`}
      footerEnd={copy.footerEnd}
    >
      <section className="content-console-grid" aria-label={copy.gridLabel}>
        <article className="content-console-identity">
          <div className="content-console-kicker">
            {copy.kicker.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="content-console-title">
            <span>{copy.title}</span>
          </div>
          <p className="content-console-summary">{copy.summary}</p>
          <div className="content-console-readouts">
            <div>
              <span>{copy.countLabel}</span>
              <span>{registerCount}</span>
            </div>
            <div>
              <span>{copy.modeLabel}</span>
              <span>{copy.modeValue}</span>
            </div>
            <div>
              <span>Last Publish</span>
              <span>{latestLabel}</span>
            </div>
          </div>
        </article>

        <article className="content-console-manifest">
          <div className="content-console-panel-heading">Section Scope</div>
          <div className="content-console-manifest-copy">{copy.scopeCopy}</div>
          <div className="content-console-manifest-grid">
            <div>
              <span>Primary Route</span>
              <span>{copy.primaryRoute}</span>
            </div>
            <div>
              <span>Source Feed</span>
              <span>{copy.sourceFeed}</span>
            </div>
            <div>
              <span>{copy.stateLabel}</span>
              <span>{status === "ready" ? "Nominal" : status === "loading" ? "Syncing" : "Degraded"}</span>
            </div>
          </div>
        </article>

        <section className="content-console-register" aria-label={copy.registerLabel}>
          <div className="content-console-register-header">
            <div className="content-console-panel-heading">{copy.registerMetaLabel}</div>
            <div className="content-console-register-meta">{registerCount} entries</div>
          </div>

          <div className="content-console-register-body">
            {status === "loading" && (
              <div className="content-console-message" role="status">
                {copy.loadingMessage}
              </div>
            )}

            {status === "error" && <div className="content-console-message">{copy.errorMessage}</div>}

            {status === "ready" && posts.length === 0 && (
              <div className="content-console-message">{copy.emptyMessage}</div>
            )}

            {status === "ready" &&
              posts.map((post, index) => (
                <button
                  key={post._id}
                  type="button"
                  className={`content-console-entry${selectedSlug === post.slug ? " is-selected" : ""}`}
                  onClick={() => selectPost(post.slug)}
                  aria-pressed={selectedSlug === post.slug}
                >
                  <span className="content-console-entry-id">
                    {copy.entryPrefix}-{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="content-console-entry-copy">
                    <div className="content-console-entry-topline">
                      <span className="content-console-entry-title">{post.title}</span>
                      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
                    </div>
                    <p>{post.excerpt || copy.fallbackCopy}</p>
                  </div>
                  <SelectorIndicator />
                </button>
              ))}
          </div>

          <div className="content-console-register-footer">{copy.registerFooter}</div>
        </section>

        <div className="content-console-navwrap">
          <UplinkDirectory />

          <aside className="content-console-signals" aria-label={copy.signalsLabel}>
            <div className="content-console-panel-heading">{copy.signalsHeading}</div>
            <div className="content-console-signal-list">
              <ReadoutRow label="Route Status" value="Live route" />
              <ReadoutRow label="Latest Publish" value={latestLabel} />
              <ReadoutRow
                label={copy.windowLabel}
                value={featuredTitles.length > 0 ? `${featuredTitles.length} ${copy.windowReadySuffix}` : "Awaiting sync"}
              />
              <ReadoutRow label={copy.busLabel} value={detailStatus === "ready" ? copy.busReady : copy.busLoading} />
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
                <div className="content-console-feature-empty">{copy.featureEmpty}</div>
              )}
            </div>
          </aside>
        </div>

        <article className="content-console-viewer" aria-label={copy.viewerLabel}>
          <div className="content-console-viewer-header">
            <div className="content-console-panel-heading">{copy.viewerHeading}</div>
            <div className="content-console-viewer-meta">
              {selectedPreview ? `${copy.viewerMetaPrefix} / ${selectedPreview.slug.toUpperCase()}` : "Awaiting selection"}
            </div>
          </div>

          {detailStatus === "error" && <div className="content-console-viewer-empty">{copy.detailErrorMessage}</div>}

          {detailStatus === "idle" && !selectedPreview && (
            <div className="content-console-viewer-empty">{copy.idleMessage}</div>
          )}

          {selectedPreview && detailStatus !== "error" && (
            <div className="content-console-viewer-body">
              <div className="content-console-viewer-copy">
                <div className="content-console-viewer-titleblock">
                  <div className="content-console-viewer-title">{selectedPreview.title}</div>
                  <div className="content-console-viewer-subline">
                    <span>{selectedPreview.publishedAt ? formatPostDate(selectedPreview.publishedAt) : "Undated"}</span>
                    <span>{detailStatus === "loading" ? copy.selectedLoadingLabel : copy.selectedReadyLabel}</span>
                  </div>
                </div>

                <p className="content-console-viewer-summary">{selectedSummary}</p>

                <div className="content-console-viewer-readouts">
                  <ReadoutRow label="Canonical Route" value={`${copy.primaryRoute}/${selectedPreview.slug}`} />
                  <ReadoutRow label="Section" value={copy.canonicalSectionLabel} />
                  <ReadoutRow
                    label="Body Blocks"
                    value={selectedPost?.body ? String(selectedPost.body.length).padStart(2, "0") : copy.bodyBlocksEmpty}
                  />
                  <ReadoutRow label={`${copy.viewerHeading.replace(" Bay", "")} Status`} value={detailStatus === "ready" ? "Loaded" : "Syncing"} />
                </div>

                <div className="content-console-viewer-text">
                  {selectedBodyPreview.length > 0 ? (
                    selectedBodyPreview.map((paragraph, index) => <p key={`${selectedPreview._id}-${index}`}>{paragraph}</p>)
                  ) : (
                    <p>{copy.bodyFallback}</p>
                  )}
                </div>

                <div className="content-console-viewer-actions">
                  <Link to={`${copy.primaryRoute}/${selectedPreview.slug}`} className="content-console-inline-link">
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
                    <div className="content-console-viewer-plate-title">{copy.plateTitle}</div>
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
