import Head from "next/head";
import { useState } from "react";
import SiteNav from "../components/SiteNav";
import styles from "../styles/Rules.module.css";

const rules = [
  {
    id: "host",
    title: "Host Chooses The Pizza",
    copy: "One host is responsible for choosing the date and selecting the venue."
  },
  {
    id: "veto",
    title: "Vetoes Before the Cut",
    copy: "At the beginning of each month, the host asks for date options, then checks vetoes from everyone."
  },
  {
    id: "tab",
    title: "Host Pays The Tab",
    copy: "The host places the order and pays for everyone."
  },
  {
    id: "toast",
    title: "Toast First",
    copy: "The night starts with a toast, then we eat and keep things moving."
  },
  {
    id: "rank",
    title: "Pizza Judges",
    copy: "After the night, everyone ranks the place so future rounds get better."
  },
  {
    id: "privacy",
    title: "Closed Booth",
    copy: "No guests, no invites, no one else. It’s just the four of us."
  }
];

export default function RulesPage() {
  const [revealedRule, setRevealedRule] = useState(null);

  const toggleRule = (id) => {
    setRevealedRule((current) => (current === id ? null : id));
  };

  return (
    <>
      <Head>
        <title>Flatbread Night · Rules</title>
        <meta
          name="description"
          content="Flatbread Night rules for monthly host rotation, dates, and after-night ranking."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.badge}>Rules</p>
          <h1>Flatbread Rulebook</h1>
          <p className={styles.subhead}>Tap the slice icon to reveal the rule.</p>
          <div className={styles.sliceGrid} role="list">
            {rules.map((rule) => (
              <article
                key={rule.id}
                className={`${styles.sliceCard} ${
                  revealedRule === rule.id ? styles.sliceCardOpen : ""
                }`}
                role="listitem"
              >
                <div className={styles.sliceCardHeader}>
                  <button
                    type="button"
                    className={styles.sliceBadgeButton}
                    onClick={() => toggleRule(rule.id)}
                    aria-expanded={revealedRule === rule.id}
                    aria-label={`Toggle rule: ${rule.title}`}
                  >
                    <span className={styles.sliceBadge} aria-hidden="true">
                      🍕
                    </span>
                  </button>
                  <span className={styles.sliceTitle}>{rule.title}</span>
                </div>
                <span className={styles.sliceBody}>{rule.copy}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
