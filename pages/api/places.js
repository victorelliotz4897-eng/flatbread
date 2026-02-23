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
const PLACES_SELECT = [
  "id",
  "name",
  "date",
  "date_raw",
  "visit_date",
  "address",
  "lat",
  "lng",
  "is_custom",
  "is_closed",
  "host_user_id",
  "ordered_items"
].join(",");

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

function getSupabaseUrl(path) {
  return `${SUPABASE_URL.replace(/\/$/, "")}/${path}`;
}

function normalizePlaceRow(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = String(row.id || "").trim();
  const name = String(row.name || "").trim();
  if (!id || !name) {
    return null;
  }
  return {
    id,
    name,
    date: String(row.date || "").trim(),
    dateRaw: String(row.date_raw || row.date || "").trim(),
    visit_date: row.visit_date || null,
    address: String(row.address || "").trim(),
    lat: Number(row.lat),
    lng: Number(row.lng),
    is_custom: row.is_custom === true,
    is_closed: row.is_closed === true,
    host_user_id: row.host_user_id || null,
    ordered_items: row.ordered_items || null
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonError(res, 405, "Method not allowed");
  }

  if (!hasSupabaseConfig()) {
    return jsonError(
      res,
      500,
      `Missing Supabase credentials. Set ${SUPABASE_URL_CANDIDATES} and one of: ${SUPABASE_KEY_CANDIDATES}.`
    );
  }

  try {
    const endpoint = `${getSupabaseUrl("rest/v1/places")}?select=${encodeURIComponent(PLACES_SELECT)}&order=visit_date.asc`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: supabaseHeaders()
    });

    if (!response.ok) {
      const responseText = await response.text();
      return jsonError(res, response.status, responseText || "Failed to load places.");
    }

    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : [];
    const places = rows.map(normalizePlaceRow).filter(Boolean);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ places }));
  } catch (error) {
    return jsonError(res, 500, String(error?.message || "Could not load places."));
  }
}
