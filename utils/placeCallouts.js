const RAW_PLACE_HINTS = {
  "ignazio's": "Half circle, half square pie.",
  "zazzy's pizza": "This one usually belongs right at the bottom.",
  "roberta's": "Someone put the pizza knife down to prove a point. 🥃",
  "sauce restaurant": "Hint: this one tries to sneak into the center of the table, and gets a little offended when it can't.",
  "lazzara's pizza cafe": "Lunchables",
  "unregular pizza": "Wasn't this a bakery?",
  "the galley pizza & eatery": "You definitely did NOT need to ride forever for this one.",
  "totonno's": "You might feel a little lifted, but the slice stays sharp.",
  "lucali": "There were no banana peppers!",
  "beach haus brewery": "🦵🦽🦿",
  "chrissy's pizza": "⚾ is your pizza destiny. You probably don't remember.",
  "ops": "\"Don't shoo me off.\"",
  "grimaldi's pizzeria": "🍃💸 Basil Surcharge",
  "nolita pizza": "A little tourist trap.",
  "ribalta": "🍜",
  "arturo's coal oven pizza": "There may not have been flavor, but there were vibes. 🎵",
  "john's of bleecker street": "❄️ This one arrived with an emergency chill package.",
  "giuseppina's": "Giuseppeeeeeeeeeeeeeeena's",
  "paulie gee's": "Hot honey, but you know what that means.",
  "macoletta": "The least memorable pizza of all time.",
  "sea bright pizzeria": "Domino's",
  "juliana's": "RIP",
  "giuliana's": "RIP",
  "see no evil pizza": "One little link and one huge joke, if you know what I mean.",
  "sauce": "Hint: this one tries to sneak into the center of the table, and gets a little offended when it can't.",
  "regular sauce": "Hint: this one tries to sneak into the center of the table, and gets a little offended when it can't.",
  "regaulr sauce": "Hint: this one tries to sneak into the center of the table, and gets a little offended when it can't."
};

const CUSTOM_HINTS_STORAGE_KEY = "flatbread-custom-place-hints-v1";

const CANONICAL_LABELS = {
  "ignazio's": "Ignazio's",
  "zazzy's pizza": "Zazzy's Pizza",
  "roberta's": "Roberta's",
  "sauce restaurant": "Sauce Restaurant",
  "lazzara's pizza cafe": "Lazzara's Pizza Cafe",
  "unregular pizza": "Unregular Pizza",
  "the galley pizza & eatery": "The Galley Pizza & Eatery",
  "totonno's": "Totonno's",
  "lucali": "Lucali",
  "beach haus brewery": "Beach Haus Brewery",
  "chrissy's pizza": "Chrissy's Pizza",
  "ops": "Ops",
  "grimaldi's pizzeria": "Grimaldi's Pizzeria",
  "nolita pizza": "Nolita Pizza",
  "ribalta": "Ribalta",
  "arturo's coal oven pizza": "Arturo's Coal Oven Pizza",
  "john's of bleecker street": "John's of Bleecker Street",
  "giuseppina's": "Giuseppina's",
  "paulie gee's": "Pauly G's",
  "macoletta": "Macoletta",
  "sea bright pizzeria": "Sea Bright Pizzeria",
  "juliana's": "Juliana's",
  "giuliana's": "Giuliana's"
};

export const PLACE_HINT_ALIASES = [
  ["sauce", "sauce restaurant", "regular sauce", "regaulr sauce"],
  ["see no evil pizza", "see no evil"]
];

function cleanText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCustomPlaceHintsStorage() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_HINTS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function setCustomPlaceHintsStorage(nextHints) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(CUSTOM_HINTS_STORAGE_KEY, JSON.stringify(nextHints || {}));
  } catch {
    return;
  }
}

function getCustomPlaceHintMap() {
  const stored = getCustomPlaceHintsStorage();
  const cleaned = {};
  Object.entries(stored).forEach(([normalizedKey, payload]) => {
    const normalized = normalizePlaceHintKey(normalizedKey);
    if (!normalized) {
      return;
    }

    if (typeof payload === "string") {
      const text = payload.trim();
      if (text) {
        cleaned[normalized] = {
          display: rawLabelFromNormalized(normalized),
          hint: text
        };
      }
      return;
    }

    if (payload && typeof payload === "object" && typeof payload.hint === "string") {
      const hint = payload.hint.trim();
      if (!hint) {
        return;
      }
      const rawDisplay = String(payload.display || "").trim();
      cleaned[normalized] = {
        display: rawDisplay || rawLabelFromNormalized(normalized),
        hint
      };
    }
  });
  return cleaned;
}

function rawLabelFromNormalized(normalized) {
  if (!normalized) {
    return "";
  }
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizePlaceHintKey(value) {
  return cleanText(value);
}

const HINT_LOOKUP = Object.entries(RAW_PLACE_HINTS).reduce((acc, [key, hint]) => {
  const normalized = normalizePlaceHintKey(key);
  if (normalized) {
    acc[normalized] = hint;
  }
  return acc;
}, {});

for (const aliases of PLACE_HINT_ALIASES) {
  const [source, ...rest] = aliases.map((value) => normalizePlaceHintKey(value));
  const hint = HINT_LOOKUP[source];
  if (!hint) {
    continue;
  }
  for (const alias of rest) {
    if (alias && !HINT_LOOKUP[alias]) {
      HINT_LOOKUP[alias] = hint;
    }
  }
}

const CANONICAL_BY_NORMALIZED = Object.entries(CANONICAL_LABELS).reduce((acc, [canonical, label]) => {
  const normalized = normalizePlaceHintKey(canonical);
  if (normalized) {
    acc[normalized] = label;
  }
  return acc;
}, {});

export function getPlaceHintText(rawName) {
  const normalized = normalizePlaceHintKey(rawName);
  if (!normalized) {
    return "";
  }

  const customHints = getCustomPlaceHintMap();
  if (customHints[normalized]?.hint) {
    return customHints[normalized].hint;
  }

  if (HINT_LOOKUP[normalized]) {
    return HINT_LOOKUP[normalized];
  }

  const aliasPairs = PLACE_HINT_ALIASES
    .map(([source, ...aliases]) => ({ source: normalizePlaceHintKey(source), aliases }))
    .filter((entry) => entry.aliases.length > 0);

  for (const { source, aliases } of aliasPairs) {
    if (normalized === source || aliases.includes(normalized) || normalized.includes(source) || source.includes(normalized)) {
      return HINT_LOOKUP[source] || "";
    }
  }

  if (/\bsauce\b/.test(normalized)) {
    return HINT_LOOKUP[normalizePlaceHintKey("sauce restaurant")] || "";
  }

  return "";
}

export function getCustomPlaceHintsList() {
  const customHints = getCustomPlaceHintMap();
  return Object.entries(customHints)
    .map(([normalized, payload]) => ({
      normalized,
      display: payload.display || rawLabelFromNormalized(normalized),
      hint: payload.hint || ""
    }))
    .filter((entry) => entry.hint)
    .sort((left, right) => left.display.localeCompare(right.display, undefined, { sensitivity: "base" }));
}

export function getCustomPlaceHint(rawName) {
  const normalized = normalizePlaceHintKey(rawName);
  if (!normalized) {
    return "";
  }
  const customHints = getCustomPlaceHintMap();
  return customHints[normalized]?.hint || "";
}

export function saveCustomPlaceHint(placeName, hint) {
  const normalized = normalizePlaceHintKey(placeName);
  const trimmedName = String(placeName || "").trim();
  const trimmedHint = String(hint || "").trim();
  if (!normalized || !trimmedName || !trimmedHint) {
    return {
      updated: false,
      message: "Place name and hint are both required."
    };
  }

  const nextHints = getCustomPlaceHintMap();
  nextHints[normalized] = {
    display: trimmedName,
    hint: trimmedHint
  };
  setCustomPlaceHintsStorage(nextHints);
  return {
    updated: true,
    message: "Honor joke saved."
  };
}

export function removeCustomPlaceHint(normalizedOrDisplay) {
  const normalized = normalizePlaceHintKey(normalizedOrDisplay);
  if (!normalized) {
    return {
      updated: false,
      message: "Could not find that honor joke."
    };
  }
  const nextHints = getCustomPlaceHintMap();
  if (!nextHints[normalized]) {
    return {
      updated: false,
      message: "Could not find that honor joke."
    };
  }
  delete nextHints[normalized];
  setCustomPlaceHintsStorage(nextHints);
  return {
    updated: true,
    message: "Honor joke removed."
  };
}

function canonicalOrderKey(text) {
  return String(text || "").toLowerCase();
}

export function getPlaceHintEntries() {
  const entries = Object.keys(RAW_PLACE_HINTS)
    .filter((rawKey) => CANONICAL_BY_NORMALIZED[normalizePlaceHintKey(rawKey)])
    .map((rawKey) => {
      const normalized = normalizePlaceHintKey(rawKey);
      const canonical = CANONICAL_BY_NORMALIZED[normalized];
      return canonical
        ? {
            normalized,
            display: canonical,
            hint: RAW_PLACE_HINTS[rawKey]
          }
        : null;
    })
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.display.toLowerCase())) {
      continue;
    }
    seen.add(entry.display.toLowerCase());
    deduped.push(entry);
  }
  deduped.sort((left, right) => canonicalOrderKey(left.display).localeCompare(canonicalOrderKey(right.display)));
  const customHints = getCustomPlaceHintMap();
  for (const [normalized, payload] of Object.entries(customHints)) {
    const display = payload.display || rawLabelFromNormalized(normalized);
    const normalizedDisplay = normalizePlaceHintKey(display);
    if (!display || !payload.hint) {
      continue;
    }

    const existingIndex = deduped.findIndex((entry) => normalizePlaceHintKey(entry.normalized) === normalizedDisplay);
    if (existingIndex >= 0) {
      deduped[existingIndex] = {
        normalized,
        display,
        hint: payload.hint
      };
      continue;
    }
    deduped.push({
      normalized,
      display,
      hint: payload.hint
    });
  }

  deduped.sort((left, right) => canonicalOrderKey(left.display).localeCompare(canonicalOrderKey(right.display)));
  return deduped;
}
