import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { useEffect, useState } from "react";
import { SECRET_GALLERY_TITLE } from "../data/galleryPhotos";
import styles from "../styles/Gallery.module.css";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [source, setSource] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      try {
        const response = await fetch("/api/gallery");
        if (!response.ok) {
          throw new Error("Could not load gallery.");
        }
        const data = await response.json();
        if (isMounted) {
          setPhotos(Array.isArray(data.photos) ? data.photos : []);
          setSource(data.source || "unknown");
        }
      } catch (error) {
        if (isMounted) {
          setMessage("Could not load gallery photos from server.");
          setSource("error");
          setPhotos([]);
        }
      }
    };

    void loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Flatbread Night · Photo Vault</title>
        <meta
          name="description"
          content="Flatbread Night photo gallery for special map moments."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.badge}>Flatbread Night</p>
          <h1>{SECRET_GALLERY_TITLE}</h1>
          {source === "loading" ? <p className={styles.help}>Loading photos...</p> : null}
          {message ? <p className={styles.help}>{message}</p> : null}
          <div className={styles.grid}>
            {photos.map((photo) => (
              <figure key={photo.src} className={styles.figure}>
                <img src={photo.src} alt={photo.alt || "Flatbread moment"} />
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
          {!photos.length && !message ? <p className={styles.help}>No photos yet. Add some from the Admin dashboard.</p> : null}
        </section>
      </main>
    </>
  );
}
