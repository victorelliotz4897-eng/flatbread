import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { getClosedPlaces } from "../utils/rankingStore";
import styles from "../styles/Tombstones.module.css";

export default function TombstonesPage() {
  const closedPlaces = getClosedPlaces().sort((a, b) => a.visitDate - b.visitDate);

  return (
    <>
      <Head>
        <title>Flatbread Night · Tombstones</title>
        <meta
          name="description"
          content="Closed Flatbread Night venues and where they used to be."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.badge}>Closed Venues</p>
          <h1>🍽️ Tombstones</h1>
          <p className={styles.lead}>These venues are marked as closed and retired from the map.</p>

          {closedPlaces.length === 0 ? (
            <p className={styles.empty}>No closed venues yet.</p>
          ) : (
            <div className={styles.listWrap}>
              {closedPlaces.map((place) => (
                <article key={place.id} className={styles.row}>
                  <h2>🪦 {place.name}</h2>
                  <p>{place.date}</p>
                  <p>{place.address}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
