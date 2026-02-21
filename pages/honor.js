import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { getAllPlaces } from "../utils/rankingStore";
import { getPlaceHintEntries, normalizePlaceHintKey } from "../utils/placeCallouts";
import styles from "../styles/Honor.module.css";

function getPlaceMeta(allPlaces, entryName) {
  const target = normalizePlaceHintKey(entryName);
  return allPlaces.find((place) => {
    const normalized = normalizePlaceHintKey(place.name);
    if (!normalized) {
      return false;
    }
    return normalized === target || normalized.includes(target) || target.includes(normalized);
  }) || null;
}

export default function HonorPage() {
  const allPlaces = getAllPlaces();
  const placeHints = getPlaceHintEntries();

  return (
    <>
      <Head>
        <title>Flatbread Night · Honor</title>
        <meta
          name="description"
          content="Pizza ranking callouts and place notes from the ranking game."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.badge}>To honor</p>
          <h1>Honor</h1>
          <p className={styles.lead}>Popup callouts used during ranking comparisons.</p>

          <div className={styles.list}>
            {placeHints.map((entry) => {
              const place = getPlaceMeta(allPlaces, entry.display);
              return (
                <details key={entry.normalized} className={styles.panelItem}>
                  <summary className={styles.summary}>
                    <span>{entry.display}</span>
                    <span className={styles.chevron} aria-hidden>
                      ▼
                    </span>
                  </summary>
                  <div className={styles.body}>
                    <p className={styles.hint}>{entry.hint}</p>
                    {place ? (
                      <p className={styles.meta}>
                        {place.date}
                        {place.address ? ` — ${place.address}` : ""}
                      </p>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
