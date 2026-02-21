import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import SiteNav from "../components/SiteNav";
import { getAllPlaces, getConfiguredUsers, getRankingSession } from "../utils/rankingStore";
import styles from "../styles/HighFives.module.css";

function normalizePlaceList(placeMap, placeId) {
  return placeMap.get(placeId) || null;
}

function normalizeRankLabel(rankIndex) {
  return `#${rankIndex + 1}`;
}

function getOrdinalForUserMatch(sortUsersByName) {
  return sortUsersByName.slice().sort((left, right) => left.localeCompare(right)).join(" & ");
}

export default function HighFivesPage() {
  const [matches, setMatches] = useState([]);
  const [highFive, setHighFive] = useState(null);

  useEffect(() => {
    const configuredUsers = getConfiguredUsers().sort((left, right) => left.name.localeCompare(right.name));
    const seenUserIds = new Set();
    const allPlaces = new Map(getAllPlaces().map((place) => [place.id, place]));

    const userRankings = configuredUsers
      .map((user) => {
        const snapshot = getRankingSession(user.id);
        return {
          id: user.id,
          name: user.name,
          phase: snapshot?.phase,
          totalPlaces: Number(snapshot?.totalPlaces) || 0,
          ranked: Array.isArray(snapshot?.ranked) ? snapshot.ranked : []
        };
      })
      .filter((entry) => entry.phase === "leaderboard" && entry.ranked.length > 0);

    const cleanRankings = userRankings.filter((entry) => {
      if (!entry.id || seenUserIds.has(entry.id)) {
        return false;
      }
      if (!Number.isInteger(entry.totalPlaces) || entry.totalPlaces <= 0) {
        return false;
      }
      seenUserIds.add(entry.id);
      return true;
    });

    const totalPlaceCounts = new Map();
    for (const entry of cleanRankings) {
      const count = totalPlaceCounts.get(entry.totalPlaces) || [];
      count.push(entry);
      totalPlaceCounts.set(entry.totalPlaces, count);
    }

    const canonicalCount = [...totalPlaceCounts.keys()].sort((left, right) => right - left)[0] || 0;
    const eligibleUsers = canonicalCount > 0
      ? totalPlaceCounts.get(canonicalCount) || []
      : [];

    const matchMap = new Map();

    eligibleUsers.forEach((entry) => {
      entry.ranked.forEach((place, rankIndex) => {
        if (!place?.id) {
          return;
        }
        const key = `${place.id}::${rankIndex}`;
        const existing = matchMap.get(key);
        if (existing) {
          existing.users.push(entry.name);
          return;
        }

        matchMap.set(key, {
          key,
          placeId: place.id,
          rankIndex,
          users: [entry.name]
        });
      });
    });

    const parsedMatches = Array.from(matchMap.values())
      .filter((match) => match.users.length >= 2)
      .map((match) => {
        const place = normalizePlaceList(allPlaces, match.placeId);
        const sortedUsers = match.users.slice().sort((left, right) => left.localeCompare(right));
        return {
          ...match,
          placeName: place?.name || match.placeId,
          placeDate: place?.date || "",
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
    }, 1700);
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
            Tap a matching spot to celebrate when two or more seats agreed at the same rank.
          </p>

          {totalUsers === 0 ? (
            <p className={styles.empty}>No seats available yet.</p>
          ) : hasMatches ? (
            <div className={styles.matchList}>
              {matches.map((match) => (
                <button
                  type="button"
                  key={match.key}
                  className={styles.matchCard}
                  onClick={() => triggerHighFive(match)}
                  aria-label={`High five for ${match.placeName} at ${normalizeRankLabel(match.rankIndex)}`}
                >
                  <p className={styles.rankBadge}>{normalizeRankLabel(match.rankIndex)}</p>
                  <div className={styles.matchCopy}>
                    <p className={styles.matchName}>{match.placeName}</p>
                    {match.placeDate ? <p className={styles.matchDate}>{match.placeDate}</p> : null}
                    <p className={styles.matchUsers}>🤝 {match.userLabel}</p>
                  </div>
                  <span className={styles.cheer} aria-hidden="true">
                    👉
                  </span>
                </button>
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
          <span className={styles.highFiveEmoji} aria-hidden="true">
            🙌
          </span>
          <span className={styles.highFiveEmoji} aria-hidden="true">
            ✋
          </span>
          <span className={styles.highFiveEmoji} aria-hidden="true">
            🤜
          </span>
        </div>
      ) : null}
    </>
  );
}
