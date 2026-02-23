import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import SiteNav from "../components/SiteNav";
import {
  getAllPlaces,
  getConfiguredUsers,
  getRankingSession,
  PLACE_LIST_SYNC_EVENT,
  hydratePlacesFromServer,
  hydrateUsersFromServer,
  hydrateUserRankingStateFromServer
} from "../utils/rankingStore";
import styles from "../styles/HighFives.module.css";

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePlaceList(placeMap, placeId) {
  return placeMap.get(placeId) || null;
}

function getMatchPlaceKey(place) {
  if (!place) return "";
  return place.id || `name:${normalizeForMatch(place.name || place.normalized)}`;
}

function getMatchPlaceName(place) {
  return (place && (place.name || place.normalized)) || "";
}

function normalizeRankLabel(rankIndex) {
  return `#${rankIndex + 1}`;
}

function getOrdinalForUserMatch(sortUsersByName) {
  const sortedUsers = sortUsersByName.slice().sort((left, right) => left.localeCompare(right));
  if (sortedUsers.length <= 1) {
    return sortedUsers[0] || "";
  }
  if (sortedUsers.length === 2) {
    return `${sortedUsers[0]} & ${sortedUsers[1]}`;
  }
  const allButLast = sortedUsers.slice(0, -1).join(", ");
  return `${allButLast} & ${sortedUsers[sortedUsers.length - 1]}`;
}

export default function HighFivesPage() {
  const [matches, setMatches] = useState([]);
  const [highFive, setHighFive] = useState(null);

  useEffect(() => {
    const refreshMatches = async () => {
      await Promise.all([
        hydratePlacesFromServer(),
        hydrateUsersFromServer()
      ]);

      const configuredUsers = getConfiguredUsers()
        .sort((left, right) => left.name.localeCompare(right.name))
        .filter((user) => Boolean(user && user.id));
      const uniqueUsers = [];
      const seenIds = new Set();
      configuredUsers.forEach((user) => {
        if (seenIds.has(user.id)) {
          return;
        }
        seenIds.add(user.id);
        uniqueUsers.push(user);
      });

      const userRankings = await Promise.all(
        uniqueUsers.map(async (user) => {
          const snapshot = await hydrateUserRankingStateFromServer(user.id).catch(() => getRankingSession(user.id));
          return {
            id: user.id,
            name: user.name,
            phase: snapshot?.phase,
            ranked: Array.isArray(snapshot?.ranked) ? snapshot.ranked : []
          };
        })
      );

      const places = getAllPlaces();
      const allPlacesById = new Map(places.map((place) => [place.id, place]));
      const allPlacesByName = new Map(
        places
          .map((place) => [normalizeForMatch(place.name || place.normalized || place.id), place])
          .filter(([name]) => Boolean(name))
      );

      const cleanRankings = userRankings
        .filter((entry) => {
          if (!entry.id) {
            return false;
          }
          if (!entry.ranked || entry.ranked.length === 0) {
            return false;
          }
          if (entry.phase === "empty" || entry.phase === "landing") {
            return false;
          }
          return true;
        });

      const eligibleUsers = cleanRankings;
      const matchMap = new Map();

      eligibleUsers.forEach((entry) => {
        entry.ranked.forEach((place, rankIndex) => {
          const placeKey = getMatchPlaceKey(place);
          const placeName = getMatchPlaceName(place);
          if (!placeKey && !placeName) {
            return;
          }
          const lookupKey = place?.id ? `id:${place.id}` : `name:${normalizeForMatch(placeName)}`;
          const key = `${lookupKey}::${rankIndex}`;
          const existing = matchMap.get(key);
          if (existing) {
            existing.users.push(entry.name);
            return;
          }

          matchMap.set(key, {
            key,
            placeId: place.id,
            placeNameFallback: placeName,
            placeNameLookup: normalizeForMatch(placeName),
            rankIndex,
            users: [entry.name]
          });
        });
      });

      const parsedMatches = Array.from(matchMap.values())
        .filter((match) => match.users.length >= 2)
        .map((match) => {
          const place = match.placeId
            ? normalizePlaceList(allPlacesById, match.placeId)
            : null;
          const placeByName = allPlacesByName.get(match.placeNameLookup || "");
          const sortedUsers = match.users.slice().sort((left, right) => left.localeCompare(right));
          return {
            ...match,
            placeName: place?.name || placeByName?.name || match.placeNameFallback || "Unknown place",
            placeDate: place?.date || placeByName?.date || "",
            users: sortedUsers,
            userLabel: getOrdinalForUserMatch(sortedUsers)
          };
        })
        .sort((left, right) => {
          if (left.rankIndex !== right.rankIndex) {
            return left.rankIndex - right.rankIndex;
          }
          return left.placeName.localeCompare(right.placeName);
        });

      setMatches(parsedMatches);
    };

    refreshMatches();
    window.addEventListener(PLACE_LIST_SYNC_EVENT, refreshMatches);

    return () => {
      window.removeEventListener(PLACE_LIST_SYNC_EVENT, refreshMatches);
    };
  }, []);

  const hasMatches = matches.length > 0;
  const totalUsers = useMemo(() => {
    const users = getConfiguredUsers();
    return users.length;
  }, []);

  const triggerHighFive = (match) => {
    setHighFive(match);
    window.setTimeout(() => {
      setHighFive((current) => (current?.key === match.key ? null : current));
    }, 2600);
  };

  return (
    <>
      <Head>
        <title>Flatbread Night · High Fives</title>
        <meta
          content="Places where multiple Flatbread Night rankings match at the same position."
          name="description"
        />
      </Head>
      <SiteNav />
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.badge}>Rankings</p>
          <h1>High Fives</h1>
          <p className={styles.lead}>
            Hit the hand for each match to celebrate when two or more seats agreed at the same rank and place.
          </p>

          {totalUsers === 0 ? (
            <p className={styles.empty}>No seats available yet.</p>
          ) : hasMatches ? (
            <div className={styles.matchList}>
              {matches.map((match) => (
                <div
                  key={match.key}
                  className={styles.matchCard}
                >
                  <p className={styles.rankBadge}>{normalizeRankLabel(match.rankIndex)}</p>
                  <div className={styles.matchCopy}>
                    <p className={styles.matchName}>{match.placeName}</p>
                    {match.placeDate ? <p className={styles.matchDate}>{match.placeDate}</p> : null}
                    <p className={styles.matchUsers}>👥 {match.userLabel}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.cheer}
                    onClick={() => triggerHighFive(match)}
                    aria-label={`High five for ${match.placeName} at ${normalizeRankLabel(match.rankIndex)}`}
                  >
                    ✋
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              No shared ranks yet. Keep ranking, and match spots will appear here when they show up.
            </p>
          )}
        </section>
      </main>

      {highFive ? (
        <div className={styles.highFiveOverlay} role="status" aria-live="polite">
          <div className={styles.highFiveCard}>
            <p className={styles.highFiveTitle}>HIGH FIVES!</p>
            <p className={styles.highFiveTarget}>
              {highFive.placeName}
              <span>{normalizeRankLabel(highFive.rankIndex)}</span>
            </p>
            <p className={styles.highFiveUsers}>{highFive.userLabel}</p>
          </div>
          {["🙌", "✋", "🤜", "🤝", "🎉", "🫶"].map((emoji, index) => (
            <span
              key={emoji}
              className={`${styles.highFiveEmoji} ${styles[`highFiveEmoji_${index + 1}`]}`}
              aria-hidden="true"
            >
              {emoji}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
