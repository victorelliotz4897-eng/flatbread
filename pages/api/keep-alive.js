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
const CRON_SECRET = (process.env.CRON_SECRET || "").trim();

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const hasValidSecret = Boolean(CRON_SECRET) && req.headers.authorization === `Bearer ${CRON_SECRET}`;
  const isVercelCron = req.headers["user-agent"] === "vercel-cron/1.0";
  if (!hasValidSecret && !isVercelCron) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return sendJson(res, 503, { error: "Supabase is not configured." });
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/flatbread_app_state?select=state_key&limit=1`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return sendJson(res, 502, {
        error: "Supabase keep-alive query failed.",
        status: response.status,
        detail: detail.slice(0, 500)
      });
    }

    await response.json();
    return sendJson(res, 200, {
      ok: true,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: "Supabase keep-alive query failed.",
      detail: String(error?.message || error).slice(0, 500)
    });
  }
}
