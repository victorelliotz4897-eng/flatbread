import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { getPlaceHintEntries } from "../utils/placeCallouts";
import styles from "../styles/Honor.module.css";

export default function HonorPage() {
  const placeHints = getPlaceHintEntries();

  return (
    <>
      <Head>
        <title>Flatbread Night · Honor</title>
        <meta
          name="description"
          content="Funny pizza honor notes from the ranking game."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.badge} data-honor-trigger="true" role="button" tabIndex={0}>
            To honor
          </p>
          <h1>Honor</h1>
          <p className={styles.lead}>Tap a place to reveal its pizza joke.</p>

          <div className={styles.list}>
            {placeHints.map((entry) => {
              return (
                <details key={entry.normalized} className={styles.panelItem}>
                  <summary className={styles.summary}>
                    <span>
                      <span className={styles.sliceEmoji} aria-hidden>
                        🍕
                      </span>
                      {entry.display}
                    </span>
                    <span className={styles.chevron} aria-hidden>
                      ▼
                    </span>
                  </summary>
                  <div className={styles.body}>
                    <p className={styles.hint}>{entry.hint}</p>
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
