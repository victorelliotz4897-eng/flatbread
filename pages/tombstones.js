import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { getClosedPlaces } from "../utils/rankingStore";
import styles from "../styles/Tombstones.module.css";

const gravestoneColors = [
  ["#f5f1de", "#8b2d12", "#4f180f", "#f7d7b3"],
  ["#f9f3df", "#7d2a13", "#2e160f", "#edc28f"],
  ["#f6efd9", "#7a260f", "#2e120e", "#f1c89e"]
];

function tombstoneTheme(text) {
  const safeText = String(text || "").toLowerCase();
  const index = safeText
    .split("")
    .reduce((sum, char) => (sum + char.charCodeAt(0)) % 3, 0);
  return gravestoneColors[index];
}

export default function TombstonesPage() {
  const closedPlaces = getClosedPlaces().sort((a, b) => a.visitDate - b.visitDate);

  return (
    <>
      <Head>
        <title>Flatbread Night · Tombstones</title>
        <meta
          name="description"
          content="Places taken to the graveyard from Flatbread Night."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.badge}>Graveyard</p>
          <h1>🍽️ Tombstones</h1>
          <p className={styles.lead}>
            Places that have made their final stop in the Flatbread Night tradition.
          </p>
          <div className={styles.runnerTrack} aria-hidden="true">
            <span className={styles.runner}>
              <span className={styles.runnerBody}>🏃‍♂️</span>
              <span className={styles.runnerPizza}>🍕</span>
            </span>
          </div>

          {closedPlaces.length === 0 ? (
            <p className={styles.empty}>No places in the graveyard yet.</p>
          ) : (
            <div className={styles.listWrap}>
              {closedPlaces.map((place) => {
                const [ground, rim, outline, cap] = tombstoneTheme(place.name);
                return (
                  <article
                    key={place.id}
                    className={styles.tombstone}
                    style={{
                      "--tomb-ground": ground,
                      "--tomb-rim": rim,
                      "--tomb-outline": outline,
                      "--tomb-cap": cap
                    }}
                  >
                    <div className={styles.tombHead}>🪦</div>
                    <p className={styles.tombDate}>{place.date || "Unknown date"}</p>
                    <h2>{place.name}</h2>
                    <p className={styles.tombAddress}>{place.address}</p>
                  </article>
                );
              })}
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
