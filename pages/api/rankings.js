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
const RANKING_ADMIN_RESET_KEY = (
  process.env.RANKING_ADMIN_RESET_KEY ||
  process.env.SUPABASE_ADMIN_RESET_KEY ||
  "lakeplacid2020"
).trim();
const SUPABASE_URL_CANDIDATES = "SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_KEY_CANDIDATES = "SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_KEY, SUPABASE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY";

function getAdminResetToken(req) {
  const queryToken = req && req.query ? (req.query.admin_key || req.query.adminKey || req.query.token) : "";
  const headerToken = req && req.headers
    ? (req.headers["x-admin-key"] || req.headers["x-admin-token"] || req.headers["x-ranking-reset-key"])
    : "";
  return String(queryToken || headerToken || "").trim();
}

function isAdminResetAuthorized(req) {
  if (!RANKING_ADMIN_RESET_KEY) {
    return false;
  }
  return getAdminResetToken(req) === RANKING_ADMIN_RESET_KEY;
}

function jsonError(res, status, message) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

async function safeResponseText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function isUpsertConflict(status, responseText) {
  if (status && status !== 409 && status !== 400) {
    return false;
  }
  const text = String(responseText || "").toLowerCase();
  return text.includes("on_conflict") ||
    text.includes("constraint") ||
    text.includes("unique") ||
    text.includes("duplicate") ||
    text.includes("conflict");
}

async function upsertRankingRecord(record) {
  const endpoint = `${getSupabaseUrl("rest/v1/rankings")}?on_conflict=user_id`;
  const headers = {
    ...supabaseHeaders(),
    Prefer: "resolution=merge-duplicates"
  };
  let response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify([record])
  });
  let responseText = await safeResponseText(response);

  if (!response.ok && isUpsertConflict(response.status, responseText)) {
    const userId = normalizeId(record.user_id);
    const deleteEndpoint = `${getSupabaseUrl("rest/v1/rankings")}?user_id=eq.${encodeURIComponent(userId)}`;
    const deleteResponse = await fetch(deleteEndpoint, {
      method: "DELETE",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=minimal"
      }
    });
    if (!deleteResponse.ok) {
      const deleteText = await safeResponseText(deleteResponse);
      return {
        response,
        responseText,
        fallbackText: `Conflict fallback delete failed (${deleteResponse.status}): ${deleteText}`
      };
    }

    response = await fetch(`${getSupabaseUrl("rest/v1/rankings")}`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify([record])
    });
    responseText = await safeResponseText(response);
  }

  return { response, responseText };
}

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  };
}

function getSupabaseUrl(path) {
  return `${SUPABASE_URL.replace(/\/$/, "")}/${path}`;
}

function normalizeId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value) {
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

function normalizeSession(value) {
  if (value && typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

async function handleGet(req, res) {
  if (!hasSupabaseConfig()) {
    return jsonError(
      res,
      500,
      `Missing Supabase credentials. Set ${SUPABASE_URL_CANDIDATES} and one of: ${SUPABASE_KEY_CANDIDATES}.`
    );
  }

  const userId = normalizeId(req.query.userId);
  if (!userId) {
    return jsonError(res, 400, "userId is required.");
  }

  const endpoint = `${getSupabaseUrl("rest/v1/rankings")}?select=user_id,ranking,pending,session,undo_stack&user_id=eq.${encodeURIComponent(userId)}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=representation"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonError(res, response.status, errorText || "Supabase read failed");
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ entry: null }));
    return;
  }

  const entry = data[0] || {};
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({
    entry: {
      user_id: String(entry.user_id || ""),
      ranking: normalizeArray(entry.ranking),
      pending: normalizeArray(entry.pending),
      undo_stack: normalizeArray(entry.undo_stack),
      session: normalizeSession(entry.session)
    }
  }));
}

async function handlePost(req, res) {
  if (!hasSupabaseConfig()) {
    return jsonError(
      res,
      500,
      `Missing Supabase credentials. Set ${SUPABASE_URL_CANDIDATES} and one of: ${SUPABASE_KEY_CANDIDATES}.`
    );
  }

  const payload = typeof req.body === "string" ? (() => {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  })() : (req.body || {});

  const userId = normalizeId(payload.user_id || payload.userId);
  if (!userId) {
    return jsonError(res, 400, "user_id is required.");
  }

  const record = {
    user_id: userId,
    ranking: normalizeArray(payload.ranking),
    pending: normalizeArray(payload.pending),
    undo_stack: normalizeArray(payload.undo_stack || payload.undoStack),
    session: normalizeSession(payload.session),
    updated_at: new Date().toISOString()
  };

  const result = await upsertRankingRecord(record);
  const response = result.response;
  const responseText = result.responseText;
  if (!response.ok) {
    const message = result.fallbackText
      ? `${responseText || "Supabase write failed"} | fallback: ${result.fallbackText}`
      : responseText || "Supabase write failed";
    return jsonError(res, response.status, message);
  }

  let output = null;
  try {
    const parsed = responseText ? JSON.parse(responseText) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      const entry = parsed[0] || {};
      output = {
        user_id: String(entry.user_id || userId),
        ranking: normalizeArray(entry.ranking),
        pending: normalizeArray(entry.pending),
        undo_stack: normalizeArray(entry.undo_stack),
        session: normalizeSession(entry.session)
      };
    }
  } catch {
    output = { user_id: userId, ...record };
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ entry: output || { user_id: userId, ...record } }));
}

async function handleDelete(req, res) {
  if (!hasSupabaseConfig()) {
    return jsonError(
      res,
      500,
      `Missing Supabase credentials. Set ${SUPABASE_URL_CANDIDATES} and one of: ${SUPABASE_KEY_CANDIDATES}.`
    );
  }

  if (!isAdminResetAuthorized(req)) {
    return jsonError(res, 401, "Unauthorized reset request.");
  }

  const userId = normalizeId(req.query.userId);
  const endpoint = userId
    ? `${getSupabaseUrl("rest/v1/rankings")}?user_id=eq.${encodeURIComponent(userId)}`
    : `${getSupabaseUrl("rest/v1/rankings")}`;

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=minimal"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonError(res, response.status, errorText || "Supabase reset failed.");
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ reset: "ok", userId: userId || "all-users" }));
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return jsonError(res, 405, "Method not allowed");
}
