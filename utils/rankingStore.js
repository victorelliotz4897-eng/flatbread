import { flatbreadLocations } from "../data/locations";

const STORAGE_KEY = "flatbread-ranking-state-v1";
const SCHEMA_VERSION = 1;
const RANKING_SYNC_ENDPOINT = "/api/rankings";
const TEST_USER_LIST_KEY = "flatbread-test-user-accounts-v1";
const USER_PASSWORDS_KEY = "flatbread-user-passwords-v1";
const PLACE_STATE_CLOSED_KEY = "closedPlaceIds";

const DEFAULT_USER_PASSWORDS = {
  victor: "robertas",
  jack_dweck: "wheated",
  jack_sasson: "grimaldis",
  aaron: "lucalis"
};

export const HARDCODED_USERS = [
  { id: "victor", name: "Victor Zeitoune" },
  { id: "jack_dweck", name: "Jack Dweck" },
  { id: "jack_sasson", name: "Jack Sasson" },
  { id: "aaron", name: "Aaron Silvers" }
];
const RESERVED_USER_IDS = new Set(HARDCODED_USERS.map((user) => user.id));

const monthIndexMap = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  sept: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};

function nowAsDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeId(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseYear(value) {
  const digits = Number(String(value).slice(-2));
  const year = Number(String(value));
  if (!Number.isNaN(year) && String(value).length > 2) {
    return year;
  }
  return 2000 + (digits % 100);
}

function parseDate(value) {
  const cleaned = normalizeText(value).toLowerCase();
  const raw = normalizeText(value);

  if (!cleaned) {
    return {
      display: raw || "Undated",
      visitDate: new Date()
    };
  }

  const rangeMatch = cleaned.match(/^([a-z]{3,9})\s*[-–—]\s*([a-z]{3,9})\s*'?\s*(\d{2,4})$/i);
  if (rangeMatch) {
    const start = capitalizeMonth(rangeMatch[1]);
    const end = capitalizeMonth(rangeMatch[2]);
    const year = parseYear(rangeMatch[3]);
    const month = monthIndexMap[rangeMatch[1].toLowerCase()] ?? 0;

    return {
      display: `${start} – ${end} ${year}`,
      visitDate: new Date(year, month, 1)
    };
  }

  const monthMatch = cleaned.match(/^([a-z]{3,9})\s*'?\s*(\d{2,4})$/i);
  if (monthMatch) {
    const month = monthMatch[1].toLowerCase();
    const displayMonth = capitalizeMonth(month);
    const year = parseYear(monthMatch[2]);
    const visitDate = new Date(year, monthIndexMap[month] ?? 0, 1);

    return {
      display: `${displayMonth} '${String(year).slice(-2)}`,
      visitDate
    };
  }

  const yearMatch = cleaned.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    return {
      display: `${year}`,
      visitDate: new Date(year, 0, 1)
    };
  }

  return {
    display: raw,
    visitDate: new Date()
  };
}

function capitalizeMonth(monthText) {
  if (!monthText) return monthText;
  const normalized = normalizeText(monthText).toLowerCase();
  const full =
    normalized.startsWith("sept") ? "September" :
      (normalized.length <= 3 ? monthIndexToName(monthIndexMap[normalized]) : normalizeText(monthText));
  return full.charAt(0).toUpperCase() + full.slice(1);
}

function monthIndexToName(index) {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return names[index] ?? "January";
}

function normalizeUndoPoint(point) {
  if (!point || typeof point !== "object") {
    return null;
  }
  const comparableIds = normalizeList(point.comparableIds);
  if (!point.session || typeof point.session !== "object" || typeof point.session.currentPlaceId !== "string") {
    return null;
  }
  return {
    ranking: normalizeList(point.ranking),
    pending: normalizeList(point.pending),
    session: {
      mode: typeof point.session.mode === "string" ? point.session.mode : "full",
      currentPlaceId: point.session.currentPlaceId,
      low: Number.isFinite(point.session.low) ? point.session.low : 0,
      high: Number.isFinite(point.session.high) ? point.session.high : comparableIds.length,
      mid: Number.isFinite(point.session.mid) ? point.session.mid : Math.floor(comparableIds.length / 2),
      comparableIds
    }
  };
}

function normalizeUndoStack(list) {
  const safeList = normalizeList(list);
  if (!Array.isArray(safeList)) {
    return [];
  }
  return safeList.map(normalizeUndoPoint).filter(Boolean);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function safeString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function normalizePassword(value) {
  return safeString(value).toLowerCase();
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => safeString(item)).filter(Boolean)
    : [];
}

function normalizePlaceIdList(value) {
  const values = normalizeList(value);
  const seen = new Set();
  return values
    .map((entry) => safeString(entry))
    .filter((entry) => {
      if (!entry || seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    });
}

function safeClone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function parseCustomUsers(rawUsers) {
  if (!Array.isArray(rawUsers)) {
    return [];
  }
  const users = [];
  const seen = new Set();

  for (const rawUser of rawUsers) {
    if (!rawUser || typeof rawUser !== "object") {
      continue;
    }
    const name = safeString(rawUser.name);
    const id = normalizeId(rawUser.id || name);
    if (!id || RESERVED_USER_IDS.has(id)) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    users.push({
      id,
      name,
      password: normalizePassword(rawUser.password)
    });
    seen.add(id);
  }

  return users;
}

function readCustomUsersFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(TEST_USER_LIST_KEY);
    return parseCustomUsers(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function readPasswordStore() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(USER_PASSWORDS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    const map = {};
    Object.keys(parsed).forEach((key) => {
      const value = normalizePassword(parsed[key]);
      if (key && value) {
        map[key] = value;
      }
    });
    return map;
  } catch {
    return {};
  }
}

function writePasswordStore(map) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(USER_PASSWORDS_KEY, JSON.stringify(map || {}));
  } catch {
    // no-op
  }
}

function getPasswordForUserId(userId) {
  const id = safeString(userId);
  if (!id) {
    return "";
  }
  const overrides = readPasswordStore();
  if (Object.prototype.hasOwnProperty.call(overrides, id)) {
    return overrides[id] || "";
  }
  return DEFAULT_USER_PASSWORDS[id] || "";
}

function writeCustomUsersToStorage(users) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(TEST_USER_LIST_KEY, JSON.stringify(users));
  } catch {
    // no-op
  }
}

function getConfiguredUserList() {
  return [...HARDCODED_USERS, ...readCustomUsersFromStorage()];
}

function normalizeMatchName(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function legacyIdName(id) {
  const asText = normalizeText(id);
  if (!asText) {
    return "";
  }
  return normalizeMatchName(asText.split("::")[0] || "");
}

function migratePlaceIdCandidates(allPlaces) {
  const byName = new Map();

  for (const place of allPlaces) {
    const key = normalizeMatchName(place.name);
    const list = byName.get(key);
    if (list) {
      list.push(place.id);
      continue;
    }
    byName.set(key, [place.id]);
  }

  return byName;
}

function reconcilePlaceIds(rawIds, allPlaces) {
  const placeIds = new Map();
  for (const place of allPlaces) {
    placeIds.set(place.id, true);
  }

  const byName = migratePlaceIdCandidates(allPlaces);
  const reconciled = [];
  const seen = new Set();

  for (const rawId of Array.isArray(rawIds) ? rawIds : []) {
    const candidate = safeString(rawId);
    if (!candidate) {
      continue;
    }

    let resolved = placeIds.has(candidate) ? candidate : null;
    if (!resolved) {
      const legacyName = legacyIdName(candidate);
      const alternatives = legacyName ? byName.get(legacyName) : null;
      if (Array.isArray(alternatives) && alternatives.length === 1) {
        resolved = alternatives[0];
      }
    }

    if (!resolved || seen.has(resolved)) {
      continue;
    }
    seen.add(resolved);
    reconciled.push(resolved);
  }

  return reconciled;
}

function isBuiltInUser(userId) {
  return RESERVED_USER_IDS.has(userId);
}

function syncAllowedForUser(userId) {
  return isBuiltInUser(userId);
}

function isKnownUserId(userId) {
  return getConfiguredUserList().some((user) => user.id === userId);
}

function syncRankingStateToServer(userId, state) {
  if (typeof window === "undefined") {
    return;
  }

  if (!syncAllowedForUser(userId)) {
    return;
  }

  const user = state?.users?.[userId];
  if (!user || !safeString(userId)) {
    return;
  }

  const payload = {
    user_id: userId,
    ranking: normalizeList(user.ranking),
    pending: normalizeList(user.pending),
    session: user.session || null,
    undo_stack: normalizeUndoStack(user.undoStack),
    updated_at: new Date().toISOString()
  };

  try {
    fetch(RANKING_SYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // best-effort sync; local fallback remains source of truth
    });
  } catch {
    // no-op
  }
}

function mapRankingEntry(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return {
    user_id: safeString(raw.user_id || raw.userId),
    ranking: normalizeList(raw.ranking),
    pending: normalizeList(raw.pending),
    undo_stack: normalizeUndoStack(raw.undo_stack || raw.undoStack),
    session: normalizeSessionState(raw.session)
  };
}

export async function hydrateUserRankingStateFromServer(userId) {
  if (typeof window === "undefined") {
    return getRankingSession(userId);
  }

  const trimmedUserId = safeString(userId);
  if (!trimmedUserId) {
    return null;
  }

  const state = getStorageState();
  if (!isBuiltInUser(trimmedUserId)) {
    return commitAndGetSnapshot(state, trimmedUserId);
  }
  ensureUser(state, trimmedUserId);
  const user = state.users[trimmedUserId];

  try {
    const response = await fetch(`${RANKING_SYNC_ENDPOINT}?userId=${encodeURIComponent(trimmedUserId)}`);
    if (!response.ok) {
      return commitAndGetSnapshot(state, trimmedUserId);
    }

    const payload = await response.json();
    const entry = mapRankingEntry(payload?.entry || payload);
    if (!entry || entry.user_id !== trimmedUserId) {
      return commitAndGetSnapshot(state, trimmedUserId);
    }

    user.ranking = normalizeList(entry.ranking);
    user.pending = normalizeList(entry.pending);
    user.undoStack = normalizeUndoStack(entry.undo_stack);
    user.session = entry.session;
    return commitAndGetSnapshot(state, trimmedUserId);
  } catch {
    return commitAndGetSnapshot(state, trimmedUserId);
  }
}

function normalizeSessionState(rawSession) {
  if (!rawSession || typeof rawSession !== "object") {
    return null;
  }

  const session = { ...rawSession };
  session.currentPlaceId = typeof session.currentPlaceId === "string" ? session.currentPlaceId : null;
  session.mode = typeof session.mode === "string" ? session.mode : "full";
  session.comparableIds = normalizeList(session.comparableIds);
  session.low = Number.isFinite(session.low) ? session.low : 0;
  session.high = Number.isFinite(session.high) ? session.high : session.comparableIds.length;
  session.mid = Number.isFinite(session.mid)
    ? session.mid
    : Math.floor(session.comparableIds.length / 2);
  session.undoStack = normalizeList(session.undoStack);

  return session.currentPlaceId ? session : null;
}

function baseState() {
  const users = {};
  for (const user of getConfiguredUserList()) {
    users[user.id] = { ranking: [], pending: [], undoStack: [], session: null };
  }
  return {
    version: SCHEMA_VERSION,
    users,
    places: {
      custom: [],
      [PLACE_STATE_CLOSED_KEY]: []
    }
  };
}

function getStorageState() {
  if (typeof window === "undefined") {
    return baseState();
  }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return baseState();
      }
      const parsed = JSON.parse(stored);
      const merged = baseState();
      merged.users = {
      ...merged.users,
      ...(parsed.users || {})
    };
      const configuredIds = new Set(getConfiguredUserList().map((user) => user.id));
      Object.keys(merged.users).forEach((userId) => {
        if (!configuredIds.has(userId)) {
          delete merged.users[userId];
        }
      });
      Object.keys(merged.users).forEach((userId) => {
        ensureUser(merged, userId);
        const user = merged.users[userId];
      user.ranking = normalizeList(user.ranking);
      user.pending = normalizeList(user.pending);
      user.undoStack = normalizeList(user.undoStack);
      user.session = normalizeSessionState(user.session);
    });
    merged.places = {
      custom: Array.isArray(parsed.places?.custom) ? parsed.places.custom : [],
      [PLACE_STATE_CLOSED_KEY]: Array.isArray(parsed.places?.[PLACE_STATE_CLOSED_KEY])
        ? normalizePlaceIdList(parsed.places[PLACE_STATE_CLOSED_KEY])
        : []
    };
    merged.version = parsed.version || SCHEMA_VERSION;

    const allPlaces = allChronologicalPlaces(merged);
    const validPlaceIds = new Set(allPlaces.map((place) => place.id));
    merged.places[PLACE_STATE_CLOSED_KEY] = merged.places[PLACE_STATE_CLOSED_KEY].filter((id) =>
      validPlaceIds.has(id)
    );
    return merged;
  } catch (error) {
    return baseState();
  }
}

function saveState(state) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // no-op if localStorage is unavailable
  }
}

function commitAndGetSnapshot(state, userId) {
  const snapshot = buildRankingSnapshot(state, userId);
  state.version = SCHEMA_VERSION;
  saveState(state);
  return snapshot;
}

function sanitizePlace(raw) {
  const parsed = parseDate(raw.date);
  const displayDate = parsed.display || normalizeText(raw.date);
  return {
    id: raw.id,
    name: normalizeText(raw.name),
    date: displayDate,
    dateRaw: normalizeText(raw.date),
    address: normalizeText(raw.address),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    visitDate: parsed.visitDate.toISOString(),
    source: "custom",
    targetUsers: normalizeStringList(raw.targetUsers)
  };
}

function hydrateBasePlace(place) {
  const normalized = normalizeText(place.dateRaw || place.date);
  return {
    ...place,
    source: "historic",
    targetUsers: normalizeStringList(place.targetUsers),
    visitDate: nowAsDate(place.visitDate),
    date: place.date,
    dateRaw: normalized || place.date
  };
}

function hydrateCustomPlace(place) {
  return {
    ...place,
    targetUsers: normalizeStringList(place.targetUsers),
    source: "custom",
    visitDate: nowAsDate(place.visitDate)
  };
}

function ensureUser(state, userId) {
  if (!state.users[userId]) {
    state.users[userId] = { ranking: [], pending: [], session: null };
  }
  if (!Array.isArray(state.users[userId].ranking)) {
    state.users[userId].ranking = [];
  }
  if (!Array.isArray(state.users[userId].pending)) {
    state.users[userId].pending = [];
  }
  if (state.users[userId].session === undefined) {
    state.users[userId].session = null;
  }
  if (!Array.isArray(state.users[userId].undoStack)) {
    state.users[userId].undoStack = [];
  }
}

function cleanUserStateFromAvailablePlaces(user, allPlaces) {
  const placeIds = new Set(allPlaces.map((place) => place.id));
  const reconciledRanking = reconcilePlaceIds(user.ranking, allPlaces);
  const reconciledPending = reconcilePlaceIds(user.pending, allPlaces);

  user.ranking = reconciledRanking.filter((id) => placeIds.has(id));
  user.pending = reconciledPending.filter((id) => placeIds.has(id));

  const unique = [];
  const seen = new Set();
  for (const placeId of user.ranking) {
    if (seen.has(placeId)) {
      continue;
    }
    seen.add(placeId);
    unique.push(placeId);
  }
  user.ranking = unique;
}

function rankedPlaceSet(user) {
  return new Set(user.ranking);
}

function nextUnrankedPlace(allPlaces, user) {
  const ranked = rankedPlaceSet(user);
  return allPlaces.find((place) => !ranked.has(place.id)) || null;
}

function allChronologicalPlaces(state) {
  const custom = Array.isArray(state.places?.custom) ? state.places.custom : [];
  const closedSet = new Set(normalizePlaceIdList(state.places?.[PLACE_STATE_CLOSED_KEY]));
  const staticPlaces = flatbreadLocations.map(hydrateBasePlace);
  const customPlaces = custom.map(sanitizePlace).map(hydrateCustomPlace);

  const seen = new Set();
  const places = [];
  for (const place of [...staticPlaces, ...customPlaces]) {
    if (!place.id || seen.has(place.id)) {
      continue;
    }
    seen.add(place.id);
    places.push({
      ...place,
      isClosed: closedSet.has(place.id)
    });
  }

  return places.sort((a, b) => a.visitDate - b.visitDate);
}

function allChronologicalPlacesForUser(state, userId) {
  const allPlaces = allChronologicalPlaces(state);
  const targetUserId = safeString(userId);
  return allPlaces.filter((place) => {
    const targetUsers = normalizeStringList(place?.targetUsers);
    if (targetUsers.length === 0) {
      return true;
    }
    if (!targetUserId) {
      return false;
    }
    return targetUsers.includes(targetUserId);
  });
}

function placeById(places, placeId) {
  return places.find((place) => place.id === placeId);
}

function buildSession(ranking, placeId, mode, comparableIds = []) {
  const safeComparableIds = Array.isArray(comparableIds) ? comparableIds : [];
  return {
    mode,
    currentPlaceId: placeId,
    low: 0,
    high: safeComparableIds.length,
    mid: Math.floor(safeComparableIds.length / 2),
    comparableIds: safeComparableIds
  };
}

function clampInBounds(value, min, max) {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function safeSessionComparableIds(user) {
  const ids = user?.session?.comparableIds;
  return Array.isArray(ids) ? ids : [];
}

const UNDO_LIMIT = 40;

function pushUndoPoint(user) {
  if (!user?.session || typeof user.session.currentPlaceId !== "string") {
    return;
  }
  user.undoStack = normalizeUndoStack(user.undoStack);
  const comparableIds = safeSessionComparableIds(user);
  const point = {
    ranking: [...user.ranking],
    pending: [...user.pending],
    session: {
      mode: user.session.mode || "full",
      currentPlaceId: user.session.currentPlaceId,
      low: Number.isFinite(user.session.low) ? user.session.low : 0,
      high: Number.isFinite(user.session.high) ? user.session.high : comparableIds.length,
      mid: Number.isFinite(user.session.mid) ? user.session.mid : Math.floor(comparableIds.length / 2),
      comparableIds
    }
  };
  user.undoStack.push(point);
  if (user.undoStack.length > UNDO_LIMIT) {
    user.undoStack = user.undoStack.slice(-UNDO_LIMIT);
  }
}

function popUndoPoint(user) {
  if (!Array.isArray(user?.undoStack) || user.undoStack.length === 0) {
    return null;
  }
  const stack = normalizeUndoStack(user.undoStack);
  const point = stack.pop();
  user.undoStack = stack;
  return point;
}

function normalizeSession(user, comparableIds = []) {
  if (!user.session || typeof user.session !== "object") {
    user.session = null;
    return;
  }
  user.session.comparableIds = Array.isArray(user.session.comparableIds)
    ? user.session.comparableIds
    : comparableIds;
  user.session.low = Number.isFinite(user.session.low) ? user.session.low : 0;
  user.session.high = Number.isFinite(user.session.high) ? user.session.high : user.session.comparableIds.length;
  user.session.mid = Number.isFinite(user.session.mid) ? user.session.mid : Math.floor(user.session.comparableIds.length / 2);
}

function arraysMatch(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

function repairSessionForCurrentPlace(user, allPlaces) {
  if (!user?.session || typeof user.session.currentPlaceId !== "string") {
    return;
  }

  const currentPlace = placeById(allPlaces, user.session.currentPlaceId);
  if (!currentPlace) {
    user.session = null;
    return;
  }

  const computedComparable = comparableRankingIds(user, allPlaces, currentPlace);
  const existingComparable = safeSessionComparableIds(user);
  const hasComparableMismatch = !arraysMatch(existingComparable, computedComparable);

  if (hasComparableMismatch) {
    user.session = buildSession(
      user.ranking,
      currentPlace.id,
      user.session.mode || "full",
      computedComparable
    );
    return;
  }

  normalizeSession(user, existingComparable);
}

function comparableRankingIds(user, allPlaces, currentPlace) {
  if (!currentPlace) return [];
  const placeIndexById = new Map(allPlaces.map((place, index) => [place.id, index]));
  const currentIndex = placeIndexById.get(currentPlace.id);
  if (typeof currentIndex !== "number") {
    return [];
  }
  return user.ranking.filter((placeId) => {
    const rankedPlace = placeById(allPlaces, placeId);
    if (!rankedPlace) {
      return false;
    }
    const rankedIndex = placeIndexById.get(rankedPlace.id);
    return typeof rankedIndex === "number" && rankedIndex < currentIndex;
  });
}

function indexInRanking(ranking, placeId) {
  return ranking.indexOf(placeId);
}

function resolveInsertionIndex(ranking, comparableIds, rawInsertAt) {
  if (comparableIds.length === 0) {
    return ranking.length;
  }

  if (rawInsertAt <= 0) {
    const first = indexInRanking(ranking, comparableIds[0]);
    return first === -1 ? 0 : first;
  }

  if (rawInsertAt >= comparableIds.length) {
    let targetAfter = 0;
    for (const compareId of comparableIds) {
      const match = indexInRanking(ranking, compareId);
      if (match >= targetAfter) {
        targetAfter = match + 1;
      }
    }
    return targetAfter;
  }

  const anchorId = comparableIds[rawInsertAt];
  const anchorIndex = indexInRanking(ranking, anchorId);
  return anchorIndex === -1 ? ranking.length : anchorIndex;
}

function buildRankingSnapshot(state, userId) {
  const allPlaces = allChronologicalPlacesForUser(state, userId);
  const user = state.users[userId];
  const total = allPlaces.length;
  cleanUserStateFromAvailablePlaces(user, allPlaces);
  const canUndo = Array.isArray(user.undoStack) && user.undoStack.length > 0;
  if (total === 0) {
    return {
      phase: "empty",
      userId,
      userName: userNameForId(userId),
      totalPlaces: 0,
      canUndo
    };
  }

  // If ranking got cleaned down to invalid/empty, start fresh.
  if (user.ranking.length === 0) {
    user.ranking = [allPlaces[0].id];
    if (allPlaces[1]) {
      const target = allPlaces[1];
      const comparable = comparableRankingIds(user, allPlaces, target);
      user.session = buildSession(user.ranking, target.id, "full", comparable);
    }
  }

  const rankedSet = new Set(user.ranking);
  const missingPlaceIds = allPlaces
    .map((place) => place.id)
    .filter((placeId) => !rankedSet.has(placeId));
  if (missingPlaceIds.length > 0) {
    user.pending = normalizeList([
      ...user.pending,
      ...missingPlaceIds.filter((placeId) => !user.pending.includes(placeId))
    ]);
  }

  // Clean stale pending entries if those places have already been added.
  if (user.pending.length > 0) {
    user.pending = user.pending.filter((placeId) => {
      const exists = !!placeById(allPlaces, placeId);
      if (!exists) {
        return false;
      }
      return true;
    });
  }

  // If pending places exist, prioritize insertion mode for one at a time.
  if (user.pending.length > 0) {
    const nextInsertId = user.pending[0];
    if (user.ranking.includes(nextInsertId)) {
      user.pending = user.pending.filter((id) => id !== nextInsertId);
    } else if (!user.session || user.session.mode !== "insert" || user.session.currentPlaceId !== nextInsertId) {
      const place = placeById(allPlaces, nextInsertId);
      const comparable = comparableRankingIds(user, allPlaces, place);
      user.session = buildSession(user.ranking, nextInsertId, "insert", comparable);
    }
  }

  // If no insertions are pending, continue full build mode in chronological order.
  const nextTarget = user.pending.length === 0 ? nextUnrankedPlace(allPlaces, user) : null;
  if (user.pending.length === 0 && nextTarget) {
    const targetId = nextTarget.id;
    if (!user.session || user.session.mode !== "full" || user.session.currentPlaceId !== targetId) {
      const target = nextTarget;
      const comparable = comparableRankingIds(user, allPlaces, target);
      user.session = buildSession(user.ranking, targetId, "full", comparable);
    }
  }

  // Completed flow
  if (user.pending.length === 0 && user.ranking.length >= total) {
    user.session = null;
    const ranked = user.ranking.map((placeId) => placeById(allPlaces, placeId)).filter(Boolean);
    return {
      phase: "leaderboard",
      mode: "complete",
      userId,
      userName: userNameForId(userId),
      totalPlaces: total,
      canUndo,
      ranked
    };
  }

  // Waiting to play one comparison step.
  if (!user.session || !user.session.currentPlaceId || !user.ranking.length) {
    user.session = null;
    return buildRankingSnapshot(state, userId);
  }

  const comparableIds = safeSessionComparableIds(user);
  normalizeSession(user, comparableIds);

  const currentPlace = placeById(allPlaces, user.session.currentPlaceId);
  if (!currentPlace) {
    user.session = null;
    return buildRankingSnapshot(state, userId);
  }

  repairSessionForCurrentPlace(user, allPlaces);

  const compareCount = user.session.comparableIds.length;
  const compareIndex = clampInBounds(user.session.mid, 0, compareCount - 1);
  const comparePlaceId = user.session.comparableIds[compareIndex];
  const comparePlace = placeById(allPlaces, comparePlaceId);
  if (compareCount === 0) {
    if (!user.ranking.includes(currentPlace.id)) {
      user.ranking.unshift(currentPlace.id);
      if (user.session.mode === "insert") {
        user.pending = user.pending.filter((id) => id !== currentPlace.id);
      }
    }
    user.session = null;
    return buildRankingSnapshot(state, userId);
  }

  if (!comparePlace) {
    user.session = null;
    return buildRankingSnapshot(state, userId);
  }

  const rankedCount = user.ranking.length;
  const ranked = user.ranking.map((placeId) => placeById(allPlaces, placeId)).filter(Boolean);
  const progressCurrent = Math.min(rankedCount + 1, total);

  return {
    phase: "game",
    mode: user.session.mode,
    userId,
    userName: userNameForId(userId),
    totalPlaces: total,
    progressCurrent,
    progressTarget: total,
    pendingCount: user.pending.length,
    rankingCount: rankedCount,
    currentPlace,
    comparePlace,
    ranked,
    canUndo
  };
}

function userNameForId(userId) {
  return getConfiguredUserList().find((user) => user.id === userId)?.name || "Unknown";
}

export function getAllPlaces() {
  const state = getStorageState();
  return allChronologicalPlaces(state);
}

export function getClosedPlaces() {
  const state = getStorageState();
  return allChronologicalPlaces(state).filter((place) => place.isClosed);
}

export function togglePlaceClosedState(placeId) {
  const state = getStorageState();
  const id = safeString(placeId);
  if (!id) {
    return {
      updated: false,
      isClosed: false,
      message: "Missing place."
    };
  }

  const allPlaces = allChronologicalPlaces(state);
  const validSet = new Set(allPlaces.map((place) => place.id));
  if (!validSet.has(id)) {
    return {
      updated: false,
      isClosed: false,
      message: "Place not found."
    };
  }

  const current = new Set(normalizePlaceIdList(state.places?.[PLACE_STATE_CLOSED_KEY]));
  if (current.has(id)) {
    current.delete(id);
    state.places[PLACE_STATE_CLOSED_KEY] = Array.from(current);
    saveState(state);
    return {
      updated: true,
      isClosed: false,
      placeId: id
    };
  }

  current.add(id);
  state.places[PLACE_STATE_CLOSED_KEY] = Array.from(current);
  saveState(state);
  return {
    updated: true,
    isClosed: true,
    placeId: id
  };
}

export function getRankingSession(userId) {
  const state = getStorageState();
  ensureUser(state, userId);

  return commitAndGetSnapshot(state, userId);
}

export function submitRankingChoice(userId, direction) {
  const state = getStorageState();
  ensureUser(state, userId);
  const user = state.users[userId];
  if (direction !== "above" && direction !== "below") {
    const snapshot = getRankingSession(userId);
    syncRankingStateToServer(userId, state);
    return snapshot;
  }
  if (!user.session || !user.session.currentPlaceId) {
    const snapshot = getRankingSession(userId);
    syncRankingStateToServer(userId, state);
    return snapshot;
  }

  const allPlaces = allChronologicalPlacesForUser(state, userId);
  const currentPlace = placeById(allPlaces, user.session.currentPlaceId);
  repairSessionForCurrentPlace(user, allPlaces);
  normalizeSession(user, safeSessionComparableIds(user));
  if (!currentPlace) {
    user.session = null;
    const snapshot = commitAndGetSnapshot(state, userId);
    syncRankingStateToServer(userId, state);
    return snapshot;
  }
  const currentMode = user.session.mode || "full";
  if (user.ranking.includes(currentPlace.id)) {
    user.session = null;
    if (currentMode === "insert") {
      user.pending = user.pending.filter((id) => id !== currentPlace.id);
    }
    const snapshot = commitAndGetSnapshot(state, userId);
    syncRankingStateToServer(userId, state);
    return snapshot;
  }
  const comparable = safeSessionComparableIds(user);
  if (comparable.length === 0) {
    pushUndoPoint(user);
    user.ranking.unshift(currentPlace.id);
    if (currentMode === "insert") {
      user.pending = user.pending.filter((id) => id !== currentPlace.id);
    }
    user.session = null;
    const snapshot = commitAndGetSnapshot(state, userId);
    syncRankingStateToServer(userId, state);
    return snapshot;
  }

  const isAbove = direction === "above";
  const compareIndex = clampInBounds(user.session.mid, 0, comparable.length - 1);
  let low = user.session.low;
  let high = user.session.high;

  if (isAbove) {
    high = compareIndex;
  } else {
    low = compareIndex + 1;
  }

  if (low >= high) {
    pushUndoPoint(user);
    const rawInsertAt = clampInBounds(low, 0, comparable.length);
    const insertAt = resolveInsertionIndex(user.ranking, comparable, rawInsertAt);
    if (!user.ranking.includes(currentPlace.id)) {
      user.ranking.splice(insertAt, 0, currentPlace.id);
    }

    if (currentMode === "insert") {
      user.pending = user.pending.filter((id) => id !== currentPlace.id);
    }
    user.session = null;
  } else {
    pushUndoPoint(user);
    user.session.low = low;
    user.session.high = high;
    user.session.mid = Math.floor((low + high) / 2);
  }

  const snapshot = commitAndGetSnapshot(state, userId);
  syncRankingStateToServer(userId, state);
  return snapshot;
}

export function autoFillRankingForUser(userId) {
  const state = getStorageState();
  const trimmedUserId = safeString(userId);
  if (!trimmedUserId) {
    return getRankingSession(trimmedUserId);
  }

  ensureUser(state, trimmedUserId);
  if (!isKnownUserId(trimmedUserId)) {
    return commitAndGetSnapshot(state, trimmedUserId);
  }

  const places = allChronologicalPlacesForUser(state, trimmedUserId);
  const user = state.users[trimmedUserId];
  user.ranking = places.map((place) => place.id);
  user.pending = [];
  user.undoStack = [];
  user.session = null;

  syncRankingStateToServer(trimmedUserId, state);
  return commitAndGetSnapshot(state, trimmedUserId);
}

export function undoLastRankingChoice(userId) {
  const state = getStorageState();
  ensureUser(state, userId);
  const user = state.users[userId];
  const point = popUndoPoint(user);
  if (!point) {
    return commitAndGetSnapshot(state, userId);
  }

  user.ranking = normalizeList(point.ranking);
  user.pending = normalizeList(point.pending);
  user.session = point.session ? { ...point.session } : null;

  if (user.session) {
    const allPlaces = allChronologicalPlacesForUser(state, userId);
    repairSessionForCurrentPlace(user, allPlaces);
    normalizeSession(user, safeSessionComparableIds(user));
  }

  const snapshot = commitAndGetSnapshot(state, userId);
  syncRankingStateToServer(userId, state);
  return snapshot;
}

export function addPlaceAndTriggerRanking(input, options = {}) {
  const state = getStorageState();
  const name = normalizeText(input.name);
  const date = normalizeText(input.date);
  const address = normalizeText(input.address);
  const lat = Number(input.lat);
  const lng = Number(input.lng);

  if (!name || !date || !address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return {
      added: false,
      message: "Name, date, address, latitude, and longitude are all required."
    };
  }

  const parsed = parseDate(date);
  const id = `${normalizeId(name)}::${normalizeText(parsed.display).toLowerCase().replace(/\s+/g, "-")}`;
  const current = getStorageState();
  const existingIds = new Set([
    ...flatbreadLocations.map((place) => place.id),
    ...Array.isArray(current.places.custom) ? current.places.custom.map((place) => place.id) : []
  ]);

  if (existingIds.has(id)) {
    return {
      added: false,
      message: "This place already exists in the map list."
    };
  }

  const targetUsersForPlace = normalizeStringList(options?.targetUserIds).filter(isKnownUserId);

  current.places.custom.push({
    id,
    name,
    date: parsed.display,
    dateRaw: date,
    address,
    lat,
    lng,
    visitDate: parsed.visitDate.toISOString(),
    targetUsers: targetUsersForPlace
  });

  const targetSet = targetUsersForPlace.length > 0
    ? new Set(targetUsersForPlace)
    : null;

  const existingCountByUser = (userId) => {
    const placesForUser = allChronologicalPlacesForUser(current, userId);
    return placesForUser.length;
  };

  for (const user of getConfiguredUserList()) {
    if (targetSet && !targetSet.has(user.id)) {
      continue;
    }

    ensureUser(current, user.id);
    const profile = current.users[user.id];
    const existingCount = existingCountByUser(user.id);

    if (profile.ranking.length < existingCount - 1) {
      continue;
    }
    if (!profile.ranking.includes(id) && !profile.pending.includes(id)) {
      profile.pending.push(id);
    }
    syncRankingStateToServer(user.id, current);
  }

  saveState(current);
  return {
    added: true,
    place: {
      id,
      name,
      date: parsed.display,
      address,
      lat,
      lng
    }
  };
}

export function resetRankingForUser(userId) {
  const state = getStorageState();
  if (!state.users[userId]) {
    return;
  }
  state.users[userId] = { ranking: [], pending: [], undoStack: [], session: null };
  syncRankingStateToServer(userId, state);
  saveState(state);
}

export function resetAllRankings() {
  const state = getStorageState();
  getConfiguredUserList().forEach((user) => {
    state.users[user.id] = { ranking: [], pending: [], undoStack: [], session: null };
    syncRankingStateToServer(user.id, state);
  });
  saveState(state);
}

export function getUsersPendingCounts() {
  const state = getStorageState();
  return getConfiguredUserList().map((user) => {
    ensureUser(state, user.id);
    return {
      id: user.id,
      name: user.name,
      pending: state.users[user.id].pending.length
    };
  });
}

export function getConfiguredUsers() {
  return safeClone(getConfiguredUserList());
}

export function getConfiguredUsersWithPasswords() {
  const configuredUsers = getConfiguredUserList();
  return configuredUsers.map((user) => ({
    ...safeClone(user),
    password: getPasswordForUserId(user.id) || user.password || ""
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getPasswordForUser(userId) {
  return getPasswordForUserId(userId);
}

export function setPasswordForUser(userId, password) {
  const id = safeString(userId);
  const candidate = normalizePassword(password);
  if (!id) {
    return {
      updated: false,
      message: "Missing user."
    };
  }
  if (!candidate) {
    return {
      updated: false,
      message: "Password cannot be empty."
    };
  }
  if (!getConfiguredUserList().some((user) => user.id === id)) {
    return {
      updated: false,
      message: "User not found."
    };
  }

  const map = readPasswordStore();
  map[id] = candidate;
  writePasswordStore(map);
  return {
    updated: true,
    message: "Password updated.",
    password: candidate
  };
}

export function addTestUser(name) {
  const normalizedName = safeString(name);
  if (!normalizedName) {
    return {
      added: false,
      message: "A name is required."
    };
  }

  const id = normalizeId(normalizedName);
  if (!id) {
    return {
      added: false,
      message: "Unable to create a valid ID for that name."
    };
  }
  if (RESERVED_USER_IDS.has(id) || readCustomUsersFromStorage().some((user) => user.id === id)) {
    return {
      added: false,
      message: "A user with that name already exists."
    };
  }

  const users = readCustomUsersFromStorage();
  users.push({ id, name: normalizedName });
  writeCustomUsersToStorage(users);

  const state = getStorageState();
  ensureUser(state, id);
  saveState(state);

  return {
    added: true,
    user: { id, name: normalizedName }
  };
}

export function removeTestUser(userId) {
  const trimmedId = safeString(userId);
  if (!trimmedId || RESERVED_USER_IDS.has(trimmedId)) {
    return {
      removed: false,
      message: "Cannot remove a built-in user."
    };
  }

  const users = readCustomUsersFromStorage();
  const remainingUsers = users.filter((user) => user.id !== trimmedId);
  if (remainingUsers.length === users.length) {
    return {
      removed: false,
      message: "User not found."
    };
  }
  writeCustomUsersToStorage(remainingUsers);
  const passwordMap = readPasswordStore();
  if (Object.prototype.hasOwnProperty.call(passwordMap, trimmedId)) {
    delete passwordMap[trimmedId];
    writePasswordStore(passwordMap);
  }

  const state = getStorageState();
  delete state.users[trimmedId];
  if (Array.isArray(state.places?.custom)) {
    state.places.custom = state.places.custom.map((place) => {
      const targetUsers = normalizeStringList(place.targetUsers).filter((id) => id !== trimmedId);
      return {
        ...place,
        targetUsers
      };
    });
  }
  saveState(state);

  return {
    removed: true,
    message: "User removed."
  };
}
