import Head from "next/head";
import SiteNav from "../components/SiteNav";
import styles from "../styles/About.module.css";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Flatbread Night · About</title>
        <meta
          name="description"
          content="The story of Flatbread Night: from Lake Placid quarantine nights to a New York ritual."
        />
      </Head>
      <SiteNav />
      <main className={styles.aboutPage}>
        <section className={styles.card}>
          <p className={styles.badge}>Flatbread Night Lore</p>
          <h1>Flatbread Night</h1>
          <p className={styles.lede}>
            In October 2020, four of us — Aaron Silvers, Jack Dweck, Jack Sasson, and Victor Zeitoune — left New York City and relocated to Lake Placid.
            The goal was simple: escape quarantine, work remotely, and change the pace of life for a while.
          </p>
          <p>
            Lake Placid was quiet. Main Street was barely open. Restaurants were closed. The town felt like a two-block radius.
            We lived at 32 Harbor Lane on the lake, ran loops around Mirror Lake, went on long hikes (sometimes alone, sometimes with a dead phone), and tried to figure out how to fill the time.
          </p>
          <p>
            There wasn’t much to do — so we cooked.
          </p>
          <p>
            Most nights we made dinner together. But Sundays became something different. On Sundays, we made dough.
            Everyone built their own pie. Victor insisted on calling it “flatbread.” Everyone else called it pizza.
            That debate never ended — but the ritual stuck.
          </p>
          <p>
            When we returned to New York that November, we assumed Flatbread Night would fade out like most quarantine habits. Instead, we decided to keep it going.
          </p>
          <p>
            The first month back, we made it in Jack Dweck&apos;s oven. We thought the tradition would stay homemade.
          </p>
          <p>
            The next month, when it was Victor and Jack Sasson&apos;s turn to host, they didn&apos;t cook.
            That changed everything.
          </p>
          <p>
            Over the next few months, we slowly moved from apartments to actual restaurants.
            By May, when indoor dining reopened, Flatbread Night officially left our kitchens and became a standing New York City ritual.
          </p>
          <p className={styles.ritualBlock}>
            Since then, it has followed the same structure:
            <span className={styles.ritualLine}>One host.</span>
            <span className={styles.ritualLine}>One place.</span>
            <span className={styles.ritualLine}>One toast.</span>
          </p>
          <p>
            We have now had Flatbread together <strong>65 consecutive months</strong> — from October 2020 through February 2026 — without missing a single one.
          </p>
          <p className={styles.subtext}>
            It started as a way to pass time during quarantine.
            <br />
            It became a way to mark time.
          </p>
          <p className={styles.closing}>
            If you&apos;re new to the table, welcome.
            If you&apos;ve been here since Lake Placid, you already know how this ends:
            <br />
            <span className={styles.signature} data-honor-trigger="true" role="button" tabIndex={0}>To honor.</span>
          </p>
        </section>
      </main>
    </>
  );
}
