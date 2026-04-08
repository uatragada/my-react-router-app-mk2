import { useEffect, useState } from "react";
import { getPhotos, type Photo } from "../lib/sanityContent";
import { sanityImageUrl } from "../lib/sanity";
import "../styles/photography.css"; // Import your CSS file

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
        console.error("Failed to load photos from Sanity", error);
        setStatus("error");
      }
    };

    loadPhotos();
  }, []);

  return (
    <main className="photography-container flex items-center justify-center pt-32 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        {status === "loading" && <p className="gallery-status">Loading photographs...</p>}
        {status === "error" && <p className="gallery-status">Photographs are unavailable right now.</p>}
        {status === "ready" && gallery.length === 0 && <p className="gallery-status">Photographs coming soon.</p>}
        {gallery.length > 0 && (
          <section className="photos-grid" aria-label="Photography gallery">
            {gallery.map((photo, index) => {
              const previewUrl = sanityImageUrl(photo.image, { width: 500, height: 750, fit: "crop" });
              const fullUrl = photo.originalUrl || sanityImageUrl(photo.image, { width: 2400, fit: "max" });
              const alt = photo.alt || photo.title || `Photograph ${index + 1}`;

              return (
                <figure key={photo._id} className="photo-item">
                  <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={previewUrl}
                      alt={alt}
                      className="photo"
                      width="500"
                      height="750"
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </a>
                  {photo.caption && <figcaption className="photo-caption">{photo.caption}</figcaption>}
                </figure>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
