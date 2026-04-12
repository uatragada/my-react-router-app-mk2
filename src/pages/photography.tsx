import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { sanityImageUrl } from "../lib/sanity";
import { getPhotos, type Photo } from "../lib/sanityContent";
import { SystemPage, UplinkDirectory } from "../components/system-chrome";
import "../styles/photography.css";

export default function Photography() {
  const [gallery, setGallery] = useState<Photo[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await getPhotos();
        setGallery(photos);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load photography grid", error);
        setStatus("error");
      }
    };

    loadPhotos();
  }, []);

  const archiveCount = gallery.length.toString().padStart(3, "0");
  const gridConfig = useMemo(() => getPhotoGridConfig(gallery.length), [gallery.length]);
  const gridStyle = useMemo(
    () =>
      ({
        "--photo-columns": String(gridConfig.columns),
        "--photo-rows": String(gridConfig.rows),
        "--identity-cols": String(gridConfig.identityColumns),
        "--identity-rows": String(gridConfig.identityRows),
        "--nav-cells": String(gridConfig.navCells),
        "--message-cols": String(Math.max(gridConfig.columns - gridConfig.identityColumns, 1)),
      }) as CSSProperties,
    [gridConfig],
  );

  let archiveContent: ReactNode;

  if (status === "loading") {
    archiveContent = (
      <div className="photo-archive-message" role="status">
        <span className="photo-archive-message-kicker">Archive Feed / Sync</span>
        <strong className="photo-archive-message-title">Synchronizing Tiles</strong>
        <span className="photo-archive-message-copy">
          Pulling the current image register and preparing the archive grid.
        </span>
      </div>
    );
  } else if (status === "error") {
    archiveContent = (
      <div className="photo-archive-message">
        <span className="photo-archive-message-kicker">Archive Feed / Fault</span>
        <strong className="photo-archive-message-title">Signal Interrupted</strong>
        <span className="photo-archive-message-copy">
          The image registry is not reachable right now. Reload when the archive bus is back online.
        </span>
      </div>
    );
  } else if (gallery.length === 0) {
    archiveContent = (
      <div className="photo-archive-message">
        <span className="photo-archive-message-kicker">Archive Feed / Empty</span>
        <strong className="photo-archive-message-title">No Frames Indexed</strong>
        <span className="photo-archive-message-copy">
          The archive is live, but there are no published photographs in the current register yet.
        </span>
      </div>
    );
  } else {
    archiveContent = gallery.map((photo, index) => {
      const previewUrl = sanityImageUrl(photo.image, { width: 1000, height: 1000, fit: "crop" });
      const fullUrl = photo.originalUrl || sanityImageUrl(photo.image, { width: 2600, fit: "max" });
      const alt = photo.alt || photo.title || `Photograph ${index + 1}`;

      return (
        <a
          key={photo._id}
          className="photo-archive-tile"
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={alt}
          title={alt}
        >
          <img
            src={previewUrl}
            alt={alt}
            width="1000"
            height="1000"
            loading={index < 12 ? "eager" : "lazy"}
            decoding="async"
          />
        </a>
      );
    });
  }

  return (
    <SystemPage
      pageClassName="photo-archive-page"
      centerLabel="VISUAL RESEARCH INTERFACE / PHOTO ARCHIVE"
      metaLabel="LIVE ROUTE / GRID MODE"
      footerStart={`ARCHIVE COUNT / ${archiveCount}`}
      footerEnd="FORMAT / FULL FRAME GRID"
    >
      <section className="photo-archive-grid" aria-label="Photography archive grid" style={gridStyle}>
        <article className="photo-archive-identity" aria-label="Photography archive identity">
          <div className="photo-archive-kicker">
            <span>Visual</span>
            <span>Research</span>
            <span>Index</span>
          </div>
          <div className="photo-archive-title">
            <span>Photo</span>
            <span>Archive</span>
          </div>
          <div className="photo-archive-readouts">
            <div>
              <span>Archive Items</span>
              <span>{archiveCount}</span>
            </div>
            <div>
              <span>Display Mode</span>
              <span>Grid</span>
            </div>
            <div>
              <span>Source</span>
              <span>cloudyskies.exe</span>
            </div>
          </div>
        </article>

        {archiveContent}

        <div className="photo-archive-nav">
          <UplinkDirectory heading="Uplink Directory" />
        </div>
      </section>
    </SystemPage>
  );
}

function getPhotoGridConfig(photoCount: number) {
  const identityColumns = 2;
  const identityRows = 2;

  for (let rows = 2; rows <= 4; rows += 1) {
    const minimumColumns = Math.max(identityColumns + 2, rows * 2);

    for (let columns = minimumColumns; columns <= 14; columns += 1) {
      const capacity = columns * rows - identityColumns * identityRows;
      const navCells = capacity - photoCount;

      if (navCells >= 1 && navCells <= columns) {
        return { columns, rows, identityColumns, identityRows, navCells };
      }
    }
  }

  const fallbackColumns = 14;
  const fallbackRows = 4;
  const fallbackCapacity = fallbackColumns * fallbackRows - identityColumns * identityRows;

  return {
    columns: fallbackColumns,
    rows: fallbackRows,
    identityColumns,
    identityRows,
    navCells: Math.max(1, Math.min(fallbackColumns, fallbackCapacity - photoCount)),
  };
}
