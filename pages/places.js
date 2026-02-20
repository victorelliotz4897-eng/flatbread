import Head from "next/head";
import { useEffect, useState } from "react";
import SiteNav from "../components/SiteNav";
import { getAllPlaces } from "../utils/rankingStore";
import styles from "../styles/Places.module.css";

function normalizePlaces() {
  return getAllPlaces()
    .slice()
    .sort((a, b) => b.visitDate - a.visitDate)
    .map((place) => ({
      id: place.id,
      name: place.name,
      date: place.date,
      address: place.address
    }));
}

export default function PlacesPage() {
  const [places, setPlaces] = useState(() => normalizePlaces());

  useEffect(() => {
    setPlaces(normalizePlaces());
  }, []);

  return (
    <>
      <Head>
        <title>Flatbread Night · Places</title>
        <meta
          name="description"
          content="Every Flatbread Night location, with date and address."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.badge}>Places</p>
          <h1>Flatbread Night Places</h1>
          <p className={styles.lead}>
            Every place we&apos;ve gone for Flatbread Night, listed by most recent first.
          </p>

          <div className={styles.listWrap}>
            {places.map((place) => (
              <article key={place.id} className={styles.row}>
                <h2>{place.name}</h2>
                <p className={styles.date}>{place.date}</p>
                <p>{place.address}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
