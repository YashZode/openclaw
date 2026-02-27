import { createHmac } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

type TelegramAuthData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const AUTH_TTL_SECONDS = 86400; // 24 hours

export function validateTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  const { hash, ...rest } = data;
  const checkFields = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(checkFields).digest("hex");

  if (computedHash !== hash) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return now - data.auth_date < AUTH_TTL_SECONDS;
}

function parseTelegramAuthHeader(req: IncomingMessage): TelegramAuthData | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("TelegramAuth ")) {
    return null;
  }
  try {
    const decoded = Buffer.from(authHeader.slice("TelegramAuth ".length), "base64").toString(
      "utf8",
    );
    return JSON.parse(decoded) as TelegramAuthData;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

const ALLOWED_TABLE_IDS = new Set([859259, 859260, 859262]);

export function handleThirdSeatRequest(
  req: IncomingMessage,
  res: ServerResponse,
  opts: { botToken: string; baserowToken: string; baserowUrl?: string },
): boolean {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/thirdseat/")) {
    return false;
  }

  // POST /api/thirdseat/auth — validate Telegram login data
  if (pathname === "/api/thirdseat/auth" && req.method === "POST") {
    const authData = parseTelegramAuthHeader(req);
    if (!authData) {
      sendJson(res, 401, { ok: false, error: "Missing auth data" });
      return true;
    }
    if (!validateTelegramAuth(authData, opts.botToken)) {
      sendJson(res, 401, { ok: false, error: "Invalid auth" });
      return true;
    }
    sendJson(res, 200, { ok: true });
    return true;
  }

  // GET /api/thirdseat/data/:tableId — proxy to Baserow
  const dataMatch = pathname.match(/^\/api\/thirdseat\/data\/(\d+)$/);
  if (dataMatch && req.method === "GET") {
    const tableId = parseInt(dataMatch[1], 10);
    if (!ALLOWED_TABLE_IDS.has(tableId)) {
      sendJson(res, 403, { ok: false, error: "Table not allowed" });
      return true;
    }

    const authData = parseTelegramAuthHeader(req);
    if (!authData || !validateTelegramAuth(authData, opts.botToken)) {
      sendJson(res, 401, { ok: false, error: "Unauthorized" });
      return true;
    }

    const baserowUrl = opts.baserowUrl || "https://api.baserow.io";
    const apiUrl = `${baserowUrl}/api/database/rows/table/${tableId}/?user_field_names=true`;

    void fetch(apiUrl, {
      headers: { Authorization: `Token ${opts.baserowToken}` },
    })
      .then(async (upstream) => {
        const body = await upstream.text();
        res.statusCode = upstream.status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(body);
      })
      .catch((err) => {
        sendJson(res, 502, { ok: false, error: String(err) });
      });

    return true;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
  return true;
}
