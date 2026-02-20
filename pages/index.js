import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import {
  hostForMonth,
  nextHostForMonth,
  LANDING_GAME_KEY,
  getFlatbreadMonthCount
} from "../data/config";
import { flatbreadLocations } from "../data/locations";
import { getAllPlaces } from "../utils/rankingStore";
import styles from "../styles/Home.module.css";

const FlatbreadMap = dynamic(() => import("../components/FlatbreadMap"), {
  ssr: false,
  loading: () => <p className={styles.mapLoading}>Loading map...</p>
});
const FALLING_SLICE_COUNT = 7;
const FEED_REQUIRED = 4;
const FALLBACK_GAME_KEYS = [
  LANDING_GAME_KEY,
  "flatbread-landing-game",
  "flatbread-landing-game-v1",
  "flatbread-landing-game-v2",
  "flatbread-landing-game-v3",
  "flatbread-landing-game-v4"
];
const GAME_UNLOCK_VALUES = new Set(["unlocked", "1", "true"]);
const FORCE_LANDING_QUERY = "landing";

function isLandingUnlocked() {
  if (typeof window === "undefined") {
    return false;
  }
  return FALLBACK_GAME_KEYS.some((key) => {
    try {
      const value = window.localStorage.getItem(key);
      if (value === null || value === undefined) {
        return false;
      }
      return GAME_UNLOCK_VALUES.has(String(value).trim().toLowerCase());
    } catch {
      return false;
    }
  });
}

function isLandingReplayRequested() {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search || "");
  return params.get(FORCE_LANDING_QUERY) === "1";
}

function clearLandingState() {
  if (typeof window === "undefined") {
    return;
  }
  FALLBACK_GAME_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // no-op
    }
  });
}

function makeSlice(idSeed) {
  return {
    id: `slice-${Date.now()}-${idSeed}`,
    left: 8 + Math.random() * 84,
    rotation: -35 + Math.random() * 70,
    size: 58 + Math.random() * 6,
    duration: 4.8 + Math.random() * 2,
    delay: 0
  };
}

function makeSliceDeck(seedBase) {
  return Array.from({ length: FALLING_SLICE_COUNT }, (_, index) => makeSlice(`${seedBase}-${index}`));
}

export default function HomePage() {
  const isLandingReplay = false;
  const [locations, setLocations] = useState(flatbreadLocations);
  const [gameUnlocked, setGameUnlocked] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameMessage, setGameMessage] = useState("Feed me.");
  const [slices, setSlices] = useState(() => makeSliceDeck(`seed-init-${Date.now()}`));
  const [landingStarted, setLandingStarted] = useState(true);
  const [dragOverTarget, setDragOverTarget] = useState(false);
  const [slicesFed, setSlicesFed] = useState(0);
  const [draggingSliceId, setDraggingSliceId] = useState("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const currentHost = hostForMonth();
  const upcomingHost = nextHostForMonth();
  const dropTargetRef = useRef(null);
  const dragPointerRef = useRef({
    sliceId: "",
    pointerId: null,
    target: null,
    startX: 0,
    startY: 0
  });
  const placesTicker = locations
    .slice()
    .sort((a, b) => b.visitDate - a.visitDate)
    .map((location) => `${location.name} (${location.date})`);

  useEffect(() => {
    const readUnlockState = () => {
      if (isLandingReplayRequested()) {
        clearLandingState();
      }

      // Keep landing gate active for reliable entry behavior.
      setGameUnlocked(false);
      setLandingStarted(true);
    };

    readUnlockState();
    setGameLoaded(true);
    setLocations(getAllPlaces());
    window.addEventListener("storage", readUnlockState);
    return () => window.removeEventListener("storage", readUnlockState);
  }, []);

  const startLandingGame = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    if (gameUnlocked || landingStarted) {
      return;
    }

    setLandingStarted(true);
    setSlicesFed(0);
    setDragOverTarget(false);
    setDraggingSliceId("");
    setDragOffset({ x: 0, y: 0 });
    const openingDeck = makeSliceDeck(`seed-${Date.now()}`);
    setSlices(openingDeck);
    setGameMessage("Tap slices to feed.");
  };

  useEffect(() => {
    if (!gameLoaded) {
      return;
    }

    if (gameUnlocked) {
      if (slices.length > 0) {
        setSlices([]);
      }
      return;
    }

    if (!landingStarted) {
      return;
    }

    if (!slices.length) {
      setSlices(makeSliceDeck(`seed-${Date.now()}`));
    }
  }, [gameLoaded, gameUnlocked, landingStarted, slices.length]);

  useEffect(() => {
    if (!landingStarted || gameUnlocked) {
      return;
    }

    const hasNoSlices = slices.length === 0;
    if (!hasNoSlices) {
      return;
    }

    const fallbackSeed = setTimeout(() => {
      setSlices((current) => (current.length ? current : makeSliceDeck(`seed-retry-${Date.now()}`)));
    }, 120);

    return () => clearTimeout(fallbackSeed);
  }, [landingStarted, gameUnlocked, slices.length]);

  const completeLandingGame = () => {
    setSlices([]);
    setGameUnlocked(true);
    setSlicesFed(0);
    setDragOverTarget(false);
    setLandingStarted(false);
    try {
      FALLBACK_GAME_KEYS.forEach((key) => {
        window.localStorage.setItem(key, "unlocked");
      });
      window.localStorage.removeItem("flatbread-landing-game");
      window.localStorage.removeItem("flatbread-landing-game-v1");
      window.localStorage.removeItem("flatbread-landing-game-v2");
      window.localStorage.removeItem("flatbread-landing-game-v3");
    } catch {
      // no-op
    }
    setGameMessage("Ready.");
  };

  const replaceSlice = (sliceId) => {
    setSlices((previous) =>
      previous.map((slice, index) =>
        slice.id === sliceId ? makeSlice(`regen-${Date.now()}-${index}`) : slice
      )
    );
  };

  const onSliceDragStart = (event, sliceId) => {
    event.dataTransfer.setData("text/plain", sliceId);
    event.dataTransfer.effectAllowed = "move";
  };

  const isInsideDropTarget = (clientX, clientY) => {
    const target = dropTargetRef.current;
    if (!target) {
      return false;
    }
    const bounds = target.getBoundingClientRect();
    return (
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom
    );
  };

  const feedSlice = (sliceId, options = {}) => {
    if (!sliceId) {
      return;
    }
    if (gameUnlocked) {
      return;
    }
    if (!slices.some((slice) => slice.id === sliceId)) {
      return;
    }

    setSlicesFed((previous) => {
      const next = previous + 1;
      if (next >= FEED_REQUIRED) {
        completeLandingGame();
      } else {
        replaceSlice(sliceId);
      }
      return next;
    });
    if (!options.silent) {
      setDraggingSliceId("");
      setDragOffset({ x: 0, y: 0 });
      setDragOverTarget(false);
    }
  };

  const onSlicePointerDown = (event, sliceId) => {
    if (gameUnlocked) {
      return;
    }
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (typeof clientX !== "number" || typeof clientY !== "number") {
      return;
    }
    event.preventDefault();
    dragPointerRef.current = {
      sliceId,
      pointerId: event.pointerId,
      target: event.currentTarget,
      startX: clientX,
      startY: clientY
    };
    setDraggingSliceId(sliceId);
    setDragOffset({ x: 0, y: 0 });
    setDragOverTarget(isInsideDropTarget(clientX, clientY));
    if (typeof event.currentTarget?.setPointerCapture === "function" && event.pointerId !== null) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // no-op
      }
    }
  };

  const onSlicePointerMove = (event) => {
    if (!draggingSliceId) {
      return;
    }
    if (event.pointerId !== undefined && event.pointerId !== dragPointerRef.current.pointerId) {
      return;
    }
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (typeof clientX !== "number" || typeof clientY !== "number") {
      return;
    }
    setDragOffset({
      x: clientX - dragPointerRef.current.startX,
      y: clientY - dragPointerRef.current.startY
    });
    setDragOverTarget(isInsideDropTarget(clientX, clientY));
  };

  const onSlicePointerUp = (event) => {
    if (!draggingSliceId) {
      return;
    }
    if (event.pointerId !== undefined && event.pointerId !== dragPointerRef.current.pointerId) {
      return;
    }
    const clientX = event.clientX;
    const clientY = event.clientY;
    const isOverTarget = isInsideDropTarget(
      typeof clientX === "number" ? clientX : dragPointerRef.current.startX,
      typeof clientY === "number" ? clientY : dragPointerRef.current.startY
    );

    if (isOverTarget) {
      feedSlice(draggingSliceId, { silent: false });
    } else {
      setDraggingSliceId("");
      setDragOffset({ x: 0, y: 0 });
      setDragOverTarget(false);
    }
    if (dragPointerRef.current.target && dragPointerRef.current.pointerId !== null) {
      try {
        if (
          typeof dragPointerRef.current.target.releasePointerCapture === "function" &&
          event.pointerId === dragPointerRef.current.pointerId
        ) {
          dragPointerRef.current.target.releasePointerCapture(dragPointerRef.current.pointerId);
        }
      } catch {
        // no-op
      }
    }
    dragPointerRef.current = {
      sliceId: "",
      pointerId: null,
      target: null,
      startX: 0,
      startY: 0
    };
  };

  const onDropIntoPie = (event) => {
    event.preventDefault();
    setDragOverTarget(false);
    if (gameUnlocked) {
      return;
    }

    feedSlice(event.dataTransfer.getData("text/plain"));
  };

  const onDragOverTarget = (event) => {
    if (gameUnlocked) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDragEnterTarget = () => setDragOverTarget(true);
  const onDragLeaveTarget = () => setDragOverTarget(false);

  const onSliceAnimationEnd = (sliceId) => {
    if (!gameUnlocked) {
      replaceSlice(sliceId);
    }
  };

  if (!gameLoaded) {
    return (
      <main className={styles.page}>
        <p className={styles.mapLoading}>Loading Flatbread Night...</p>
      </main>
    );
  }

  if (!gameUnlocked) {
    return (
      <main className={styles.page}>
        <section className={styles.gameGateCard} aria-label="Landing gate game">
          <p className={styles.badge}>Flatbread Night Access</p>
          <h1 className={styles.headline}>Slice Down</h1>
          <p className={styles.gameMessage}>{gameMessage}</p>

          <div
            className={styles.pizzaDropArena}
            style={{}}
          >
            <div
              className={`${styles.feedTarget} ${dragOverTarget ? styles.pizzaTargetActive : ""}`}
              ref={dropTargetRef}
              onDrop={onDropIntoPie}
              onDragOver={onDragOverTarget}
              onDragEnter={onDragEnterTarget}
              onDragLeave={onDragLeaveTarget}
            >
              <span className={styles.eater} aria-hidden="true">🧍</span>
            </div>

            <div
              className={styles.sliceField}
              onPointerMove={onSlicePointerMove}
              onPointerUp={onSlicePointerUp}
              onPointerCancel={onSlicePointerUp}
            >
              {slices.map((slice) => (
                <button
                  key={slice.id}
                  type="button"
                  draggable
                  onDragStart={(event) => onSliceDragStart(event, slice.id)}
                  onClick={() => {
                    if (draggingSliceId !== slice.id) {
                      feedSlice(slice.id, { silent: false });
                    }
                  }}
                  onPointerDown={(event) => onSlicePointerDown(event, slice.id)}
                  onPointerMove={onSlicePointerMove}
                  onPointerUp={onSlicePointerUp}
                  onPointerCancel={onSlicePointerUp}
                  onTouchStart={(event) => {
                    const touch = event.touches?.[0];
                    if (!touch) {
                      return;
                    }
                    onSlicePointerDown(
                      {
                        preventDefault: () => event.preventDefault(),
                        pointerId: touch.identifier,
                        currentTarget: event.currentTarget,
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      },
                      slice.id
                    );
                  }}
                  onTouchMove={(event) => {
                    const touch = event.touches?.[0];
                    if (!touch) {
                      return;
                    }
                    onSlicePointerMove({
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                      pointerId: touch.identifier
                    });
                  }}
                  onTouchEnd={(event) => {
                    const touch = event.changedTouches?.[0];
                    if (!touch) {
                      return;
                    }
                    onSlicePointerUp({
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                      pointerId: touch.identifier,
                      preventDefault: () => event.preventDefault()
                    });
                  }}
                  className={`${styles.fallingSlice} ${draggingSliceId === slice.id ? styles.draggingSlice : ""}`}
                  style={{
                    left: `${slice.left}%`,
                    width: `${Math.max(38, slice.size)}px`,
                    height: `${Math.max(38, slice.size)}px`,
                    transform: draggingSliceId === slice.id
                      ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${slice.rotation}deg)`
                      : `rotate(${slice.rotation}deg)`,
                    animationPlayState: draggingSliceId === slice.id ? "paused" : "running",
                    "--fall-duration": `${slice.duration}s`,
                    "--fall-delay": `${slice.delay}s`
                  }}
                  onAnimationEnd={() => onSliceAnimationEnd(slice.id)}
                  aria-label="Pizza slice"
                >
                  <span className={styles.sliceEmoji} aria-hidden="true">
                    🍕
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Flatbread Night</title>
        <meta
          name="description"
          content="Flatbread Night — a monthly tradition, one host, one night, one flatbread."
        />
      </Head>
      <SiteNav places={placesTicker} />
      <main className={styles.page} id="home">
        <section className={styles.heroMapGrid}>
          <section className={styles.heroCard}>
            <p className={styles.badge}>EST. OCT 2020 · LAKE PLACID</p>
            <h1 className={styles.headline}>Flatbread Night</h1>
            <p className={styles.subhead}>A monthly tradition like no other.</p>
            <p className={styles.bodyText}>
              Each month, one person takes the reins. A date is chosen. A location is revealed.
            </p>
            <p className={styles.bodyText}>We gather. We toast. We eat. We rank.</p>
            <p className={styles.monthsStamp}>
              {getFlatbreadMonthCount(new Date())} consecutive months
            </p>
            <div className={styles.hostCard}>
              <p className={styles.hostLine}>This Month: {currentHost}</p>
              <p className={styles.nextLine}>Next up: {upcomingHost}</p>
            </div>
            <p className={styles.heroFooter}>Rotating host. Fixed rules. No exceptions.</p>
          </section>

          <section className={styles.mapPanel} aria-label="Restaurant map">
            <Link href="/places" className={styles.mapPanelTitle}>
              THE WALL OF RECORD
            </Link>
            <FlatbreadMap locations={locations} />
            <div className={styles.footerTabs} aria-label="Explore sections">
              <Link href="/rules" className={styles.tabButton} aria-label="Rules">
                <span aria-hidden>🍕</span>
              </Link>
              <Link href="/rankings" className={styles.tabButton} aria-label="Rankings">
                <span aria-hidden>🍕</span>
              </Link>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
