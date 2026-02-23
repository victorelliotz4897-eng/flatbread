import Head from "next/head";
import SiteNav from "../components/SiteNav";
import { getClosedPlaces, getConfiguredUsers, PLACE_LIST_SYNC_EVENT, hydratePlacesFromServer } from "../utils/rankingStore";
import styles from "../styles/Tombstones.module.css";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [closedPlaces, setClosedPlaces] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const runnerTrackRef = useRef(null);
  const runnerRef = useRef(null);

  useEffect(() => {
    if (!hydrated || !runnerTrackRef.current || !runnerRef.current) {
      return;
    }

    const track = runnerTrackRef.current;
    const runner = runnerRef.current;

    let x = 0;
    let y = 0;
    let vx = 3.2;
    let vy = 2.4;
    const pizza = runner.querySelector(`.${styles.runnerBody}`);
    const runnerHeight = runner.offsetHeight || 40;
    const runnerWidth = runner.offsetWidth || 60;

    let rafId = null;
    let lastSizeWidth = 0;
    let lastSizeHeight = 0;
    let running = true;

    const setBounds = () => {
      const rect = track.getBoundingClientRect();
      const maxX = Math.max(0, rect.width - runnerWidth);
      const maxY = Math.max(0, rect.height - runnerHeight - 12);
      const minX = 0;
      const minY = 0;
      x = Math.min(Math.max(x, minX), maxX);
      y = Math.min(Math.max(y, minY), maxY);
      lastSizeWidth = maxX;
      lastSizeHeight = maxY;
      if (maxX === 0) vx = 0;
      if (maxY === 0) vy = 0;
      if (!x && !y && maxX > 0 && maxY > 0) {
        x = Math.random() * maxX;
        y = Math.random() * maxY;
      }
      return { maxX, maxY, minX, minY };
    };

    const step = () => {
      if (!running) {
        return;
      }

      const { maxX, maxY, minX, minY } = setBounds();

      x += vx;
      y += vy;

      if (x <= minX || x >= maxX) {
        x = Math.min(Math.max(x, minX), maxX);
        vx = -vx;
      }

      if (y <= minY || y >= maxY) {
        y = Math.min(Math.max(y, minY), maxY);
        vy = -vy;
      }

      if (pizza) {
        pizza.style.setProperty("--runner-dir", vx < 0 ? "-1" : "1");
      }

      runner.style.transform = `translate(${x}px, ${y}px)`;
      rafId = requestAnimationFrame(step);
    };

    const resizeObserver = new ResizeObserver(() => {
      setBounds();
    });
    resizeObserver.observe(track);

    rafId = requestAnimationFrame(step);
    return () => {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
    };
  }, [hydrated]);

  useEffect(() => {
    const refreshClosedPlaces = async () => {
      await hydratePlacesFromServer();
      const places = getClosedPlaces().sort((a, b) => a.visitDate - b.visitDate);
      setClosedPlaces(places);
      const users = getConfiguredUsers();
      const nextUsersById = {};
      for (const user of users) {
        nextUsersById[user.id] = user.name;
      }
      setUsersById(nextUsersById);
      setHydrated(true);
    };

    void refreshClosedPlaces();
    window.addEventListener(PLACE_LIST_SYNC_EVENT, refreshClosedPlaces);
    return () => {
      window.removeEventListener(PLACE_LIST_SYNC_EVENT, refreshClosedPlaces);
    };
  }, []);

  const hasClosedPlaces = useMemo(() => hydrated && closedPlaces.length > 0, [hydrated, closedPlaces]);

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
          <div ref={runnerTrackRef} className={styles.runnerTrack} aria-hidden="true">
            <span ref={runnerRef} className={styles.runner}>
              <span className={styles.runnerBody}>🏃‍♂️</span>
              <span className={styles.runnerPizza}>🍕</span>
            </span>
          </div>

          {hasClosedPlaces ? (
            <div className={styles.listWrap}>
              {closedPlaces.map((place) => {
                const [ground, rim, outline, cap] = tombstoneTheme(place.name);
                const hostName = place.hostUserId
                  ? place.hostUserId === "all"
                    ? "All"
                    : usersById[place.hostUserId]
                  : "";
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
                    <div className={styles.tombContent}>
                      <div className={styles.tombstonePlate} aria-hidden="true">🪦</div>
                      <h2>{place.name}</h2>
                      <p className={styles.tombDate}>{place.date || "Unknown date"}</p>
                      <p className={styles.tombHost}>A la {hostName || "Unassigned"}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : hydrated ? (
            <p className={styles.empty}>No places in the graveyard yet.</p>
          ) : (
            <p className={styles.empty}>Loading graveyard...</p>
          )}
        </section>
      </main>
    </>
  );
}
