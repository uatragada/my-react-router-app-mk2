import React, { useEffect, useState } from "react";
import "../styles/photography.css"; // Import your CSS file

export default function Photography() {
  const [gallery, setGallery] = useState<string[]>([]); // State to store resolved photo URLs

  useEffect(() => {
    const loadPhotos = async () => {
      const photos = import.meta.glob("../assets/photography/*.{png,jpg,jpeg,gif,webp}");
      const photoUrls = await Promise.all(
        Object.values(photos).map(async (importPhoto) => {
          const photo = await importPhoto(); // Resolve the promise
          return (photo as { default: string }).default; // Get the default export (the file path)
        })
      );
      setGallery(photoUrls); // Update the state with resolved photo URLs
    };

    loadPhotos();
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>, index: number) => {
    const img = e.currentTarget;
    const height = img.naturalHeight;
    console.log(`Image ${index} height:`, height); // Debug: Log the height of each image
    const photoItem = document.querySelectorAll(".photo-item")[index] as HTMLElement;
    if (photoItem) {
      photoItem.style.setProperty("--photo-height", `${height}`);
      console.log(`Set --photo-height for photo-item ${index}:`, height); // Debug: Log the applied height
    }
  };

  return (
    <main className="photography-container flex items-center justify-center pt-24 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[800px] max-w-[300vw] p-4 title">
            <h1>My Photography</h1>
          </div>
        </header>
        <section className="photos-grid">
          {gallery.map((photo, index) => (
            <div key={index} className="photo-item">
              <a href={photo} target="_blank" rel="noopener noreferrer">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="photo"
                  loading="lazy"
                  onLoad={(e) => handleImageLoad(e, index)} // Calculate height on load
                />
              </a>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}