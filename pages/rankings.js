import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import {
  getConfiguredUsers,
  getPasswordForUser,
  hydrateUserRankingStateFromServer,
  getRankingSession,
  autoFillRankingForUser,
  submitRankingChoice,
  undoLastRankingChoice
} from "../utils/rankingStore";
import styles from "../styles/Rankings.module.css";

function formatPlaceLine(place) {
  return place?.name || "";
}

const PLACE_HINTS = {
  "ignazio's": "Half circle, half square pie.",
  "zazzy's pizza": "This one usually belongs right at the bottom.",
  "roberta's": "Somebody forgot to cut this one. 🥃",
  sauce: "Jack Sasson, try keeping this one in the middle now.",
  "regular sauce": "Jack Sasson, try keeping this one in the middle now.",
  "sauce restaurant": "Jack Sasson, try keeping this one in the middle now.",
  "regaulr sauce": "Jack Sasson, try keeping this one in the middle now.",
  "lazzara's pizza cafe": "Lunchables",
  "unregular pizza": "Wasn't this a bakery?",
  "the galley pizza & eatery": "You didn't have to ride 60 miles to enjoy this one.",
  "the galley": "You didn't have to ride 60 miles to enjoy this one.",
  "totonno's": "You might feel a little high, but the pizza stays sharp.",
  lucali: "There were no banana peppers!",
  "beach haus brewery": "🦵🦽🦿",
  "chrissy's pizza": "⚾ but you probabaly don't remember this one",
  ops: "\"Don't shoo me off.\"",
  "grimaldi's pizzeria": "🍃💸 Basil Surcharge",
  "grimaldi's": "🍃💸 Basil Surcharge",
  "nolita pizza": "A little tourist trap.",
  ribalta: "🍜",
  "arturo's coal oven pizza": "There may not have been flavor, but there were vibes. 🎵",
  "john's of bleecker street": "❄️ @Jack Dweck",
  "giuseppina's": "Giuseppeeeeeeeeeeeeeeena's",
  "paulie gee's": "Hot honey @Aaron",
  macoletta: "The least memorable pizza of all time.",
  "sea bright pizzeria": "Domino's",
  "juliana's": "RIP",
  "giuliana's": "RIP",
  "see no evil pizza": "pornhub.com/jacksasson"
};

function normalizePlaceForHint(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\w\s&']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePlaceKey(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PLACE_HINT_ENTRIES = Object.fromEntries(
  Object.entries(PLACE_HINTS).map(([name, hint]) => [normalizePlaceKey(name), hint])
);

function getPlaceHint(name) {
  const normalized = normalizePlaceKey(name);
  if (!normalized) return "";

  if (PLACE_HINT_ENTRIES[normalized]) {
    return PLACE_HINT_ENTRIES[normalized];
  }

  for (const [hintKey, hint] of Object.entries(PLACE_HINT_ENTRIES)) {
    if (normalized.includes(hintKey) || hintKey.includes(normalized)) {
      return hint;
    }
  }

  if (/\bsauce\b/.test(normalized)) {
    return "Jack Sasson, try keeping this one in the middle now.";
  }

  return "";
}

function renderChronologicalPreview(ranked) {
  if (!Array.isArray(ranked) || ranked.length === 0) {
    return null;
  }

  return (
    <div className={styles.leaderboard} aria-label="Current ranking preview">
      <p className={styles.lead}>Current ranking order</p>
      <div className={styles.scoreboardWrap}>
        {ranked.map((place, index) => (
          <article key={place?.id || `rank-${index}`} className={styles.scoreRow}>
            <span className={styles.rankPill}>#{index + 1}</span>
            <span className={styles.scoreName}>{formatPlaceLine(place)}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function RankingsPage() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [passwordInputs, setPasswordInputs] = useState({});
  const [authErrors, setAuthErrors] = useState({});
  const [activeAuthUserId, setActiveAuthUserId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const prevPhaseRef = useRef("");

  const hasPassword = (userId) => (getPasswordForUser(userId) || "").length > 0;

  const users = getConfiguredUsers();
  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

  const reloadUser = async (userId) => {
    setSelectedUserId(userId);
    try {
      const snapshotFromServer = await hydrateUserRankingStateFromServer(userId);
      setSnapshot(snapshotFromServer || getRankingSession(userId));
    } catch {
      setSnapshot(getRankingSession(userId));
    }
  };

  const handlePasswordChange = (userId, value) => {
    setPasswordInputs((prev) => ({ ...prev, [userId]: value }));
    setAuthErrors((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const openAuthForUser = (userId) => {
    setActiveAuthUserId(userId);
    setAuthErrors({});
    if (!hasPassword(userId)) {
      void reloadUser(userId);
    }
  };

  const handleSeatSubmit = (event, userId) => {
    event.preventDefault();
    const expected = getPasswordForUser(userId);
    if (expected === undefined) {
      void reloadUser(userId);
      return;
    }
    const entered = (passwordInputs[userId] || "").trim().toLowerCase();

    if (entered !== expected) {
      setAuthErrors((prev) => ({ ...prev, [userId]: "Wrong password." }));
      return;
    }

    setAuthErrors((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

    void reloadUser(userId);
  };

  const choose = (direction) => {
    if (!selectedUserId) return;
    const next = submitRankingChoice(selectedUserId, direction);
    setSnapshot(next);
  };

  const reverseLastDecision = () => {
    if (!selectedUserId) return;
    const next = undoLastRankingChoice(selectedUserId);
    setSnapshot(next);
  };

  const autoFillCurrentUser = () => {
    if (selectedUserId !== "victor") {
      return;
    }
    const next = autoFillRankingForUser(selectedUserId);
    setSnapshot(next);
  };

  const backToSeatSelection = () => {
    setSelectedUserId("");
    setSnapshot(null);
    setAuthErrors({});
    setPasswordInputs({});
    setActiveAuthUserId("");
  };

  useEffect(() => {
    if (!snapshot) {
      setShowConfetti(false);
      prevPhaseRef.current = "";
      return;
    }

    const phase = snapshot.phase;
    const shouldCelebrate = phase === "leaderboard" && prevPhaseRef.current === "game";
    if (shouldCelebrate) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 6200);
      prevPhaseRef.current = phase;
      return () => clearTimeout(timeout);
    }

    if (phase !== "leaderboard") {
      setShowConfetti(false);
    }
    prevPhaseRef.current = phase;
    return undefined;
  }, [snapshot?.phase]);

  useEffect(() => {
    if (!snapshot || snapshot.phase !== "game") {
      setCurrentHint("");
      return;
    }
    const currentName = normalizePlaceForHint(snapshot.currentPlace?.name);
    const directHint = PLACE_HINTS[currentName];
    const fallbackHint = getPlaceHint(snapshot.currentPlace?.name);
    setCurrentHint(directHint || fallbackHint || "");
  }, [snapshot?.currentPlace?.id, snapshot?.mode, snapshot?.phase]);

  return (
    <>
      <Head>
        <title>Flatbread Night · Rankings</title>
        <meta
          name="description"
          content="Ranking flow for Flatbread Night — first-time setup and monthly insertions."
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.badge} data-honor-trigger="true" role="button" tabIndex={0}>To honor</p>
          <h1>Full Ranking Mode</h1>
          {!selectedUserId ? (
            <div className={styles.userMenu}>
              <p className={styles.menuTitle}>FLATBREAD NIGHT</p>
              <p className={styles.menuSub}>— Select Your Seat —</p>
              <div className={styles.userMenuList}>
                {sortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={styles.userMenuItem}
                    role="button"
                    tabIndex={0}
                    onClick={() => openAuthForUser(user.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openAuthForUser(user.id);
                      }
                    }}
                  >
                    <p className={styles.menuSeatName}>{user.name}</p>
                    <div className={styles.userMenuRow}>
                      {activeAuthUserId === user.id && hasPassword(user.id) ? (
                        <input
                          type="password"
                          className={styles.seatPassword}
                          placeholder="seat password"
                          aria-label={`Password for ${user.name}`}
                          value={passwordInputs[user.id] || ""}
                          onChange={(event) => handlePasswordChange(user.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSeatSubmit(event, user.id);
                        }
                      }}
                      autoComplete="off"
                          autoFocus
                        />
                      ) : null}
                    </div>
                    {authErrors[user.id] ? <p className={styles.authError}>{authErrors[user.id]}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {snapshot ? (
            <div className={styles.stateWrap}>
              {selectedUserId === "victor" && (
                <button
                  type="button"
                  className={styles.pizzaSecretButton}
                  onClick={autoFillCurrentUser}
                  title="Auto-generate complete rankings for testing"
                  aria-label="Auto-generate complete rankings for testing"
                >
                  🍕
                </button>
              )}

              {snapshot.phase === "empty" ? (
                <p className={styles.lead}>No places are available yet.</p>
              ) : null}

              {snapshot.phase === "game" ? (
                <div className={styles.gameWrap}>
                  <p className={styles.lead}>
                    Full Ranking Mode
                  </p>
                  <h2>{snapshot.userName}</h2>
                  <p className={styles.progressText}>
                    Ranking {snapshot.progressCurrent} / {snapshot.progressTarget}
                  </p>
                  <div className={styles.progressBar} aria-hidden="true">
                    <span
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, (snapshot.progressCurrent / snapshot.progressTarget) * 100)}%`
                      }}
                    />
                  </div>
                  <p className={styles.currentPlace}>{formatPlaceLine(snapshot.currentPlace)}</p>
                  <div className={styles.decisionRow}>
                    <button
                      type="button"
                      className={styles.choiceButton}
                      onClick={() => choose("above")}
                    >
                      Above {snapshot.comparePlace?.name}
                    </button>
                    <button
                      type="button"
                      className={styles.choiceButton}
                      onClick={() => choose("below")}
                    >
                      Below {snapshot.comparePlace?.name}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`${styles.textButton} ${styles.pizzaUndoButton}`}
                    onClick={reverseLastDecision}
                    disabled={!snapshot.canUndo}
                  >
                    Reverse prior decision
                  </button>
                  {renderChronologicalPreview(snapshot.ranked)}
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={backToSeatSelection}
                  >
                    Back to prior rankings
                  </button>
                  {currentHint ? (
                    <div
                      className={styles.placeHintBackdrop}
                      onClick={() => setCurrentHint("")}
                    >
                      <div
                        className={styles.placeHintCard}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <p className={styles.currentPlace}>{snapshot.currentPlace?.name}</p>
                        <p className={styles.placeHintText}>{currentHint}</p>
                        <button
                          type="button"
                          className={styles.choiceButton}
                          onClick={() => setCurrentHint("")}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {snapshot.phase === "leaderboard" ? (
                <div className={styles.leaderboard}>
                    {showConfetti ? (
                    <div className={styles.pizzaConfetti} aria-hidden="true">
                      {Array.from({ length: 56 }).map((_, index) => {
                        const left = `${(index * 2.8 + 1.5) % 100}%`;
                        const delay = (index % 8) * 0.16;
                        const duration = 4.2 + (index % 7) * 0.28;
                        const rotation = (index * 29) % 360;
                        const size = 22 + (index % 7);
                        const spin = (index % 2 === 0 ? 1 : -1) * ((index * 47) % 540);
                        return (
                          <span
                            key={index}
                            className={styles.pizzaSlice}
                            style={{
                              left,
                              animationDelay: `${delay}s`,
                              animationDuration: `${duration}s`,
                              ["--pizza-rotation"]: `${rotation}deg`,
                              ["--pizza-spin"]: `${spin}deg`,
                              fontSize: `${size}px`
                            }}
                          >
                            🍕
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  <h2>{snapshot.userName}</h2>
                  <p className={styles.lead}>RETRO LEADERBOARD</p>
                  <div className={styles.scoreboardWrap} role="list" aria-label="Place ranking">
                    {Array.isArray(snapshot.ranked)
                      ? snapshot.ranked.map((place, index) => (
                        <article
                          key={`${place?.id || index}`}
                          className={styles.scoreRow}
                          role="listitem"
                        >
                          <span className={styles.rankPill}>#{index + 1}</span>
                          <span className={styles.scoreName}>{formatPlaceLine(place)}</span>
                        </article>
                        ))
                      : null}
                  </div>
                  <div className={styles.footerButtons}>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={backToSeatSelection}
                    >
                      Back to prior rankings
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
