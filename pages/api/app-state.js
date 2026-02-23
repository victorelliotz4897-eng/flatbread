const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).trim();
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""
).trim();

const SUPABASE_URL_CANDIDATES = "SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_KEY_CANDIDATES = "SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_KEY, SUPABASE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY";
const TABLE_ENDPOINT = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/flatbread_app_state`;

function jsonError(res, status, message) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  };
}

function sanitizePayload(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

async function readAppState() {
  const response = await fetch(`${TABLE_ENDPOINT}?select=state_key,payload`, {
    method: "GET",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=representation"
    }
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText || "Failed to read app state.");
  }

  const data = await response.json();
  const state = {
    places: null,
    jokes: null,
    users: null
  };

  if (!Array.isArray(data)) {
    return state;
  }

  for (const row of data) {
    const key = String(row?.state_key || "").trim();
    if (!key || !(row?.payload && typeof row.payload === "object" && !Array.isArray(row.payload))) {
      continue;
    }
    if (key === "places") {
      state.places = row.payload;
    } else if (key === "jokes") {
      state.jokes = row.payload;
    } else if (key === "users") {
      state.users = row.payload;
    }
  }

  return state;
}

async function upsertStateRow(stateKey, payload) {
  const response = await fetch(`${TABLE_ENDPOINT}?on_conflict=state_key`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify([{
      state_key: stateKey,
      payload
    }])
  });

  if (response.ok) {
    return;
  }

  const responseText = await response.text().catch(() => "");
  throw new Error(responseText || "Failed to upsert app state row.");
}

export default async function handler(req, res) {
  if (!hasSupabaseConfig()) {
    return jsonError(
      res,
      500,
      `Missing Supabase credentials. Set ${SUPABASE_URL_CANDIDATES} and one of: ${SUPABASE_KEY_CANDIDATES}.`
    );
  }

  if (req.method === "GET") {
    try {
      const state = await readAppState();
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(state));
      return;
    } catch (error) {
      return jsonError(res, 500, String(error?.message || "Could not load app state"));
    }
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? (() => {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    })() : (req.body || {});

    const places = sanitizePayload(body?.places);
    const jokes = sanitizePayload(body?.jokes);
    const users = sanitizePayload(body?.users);

    if (!places && !jokes && !users) {
      return jsonError(res, 400, "Nothing to save in request body.");
    }

    try {
      const jobs = [];
      if (places) {
        jobs.push(upsertStateRow("places", places));
      }
      if (jokes) {
        jobs.push(upsertStateRow("jokes", jokes));
      }
      if (users) {
        jobs.push(upsertStateRow("users", users));
      }
      await Promise.all(jobs);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true }));
      return;
    } catch (error) {
      return jsonError(res, 500, String(error?.message || "Could not save app state"));
    }
  }

  res.setHeader("Allow", "GET, POST");
  return jsonError(res, 405, "Method not allowed");
}
