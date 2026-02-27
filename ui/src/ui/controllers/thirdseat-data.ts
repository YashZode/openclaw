import type { TelegramUser } from "../thirdseat-auth.ts";

const TABLE_IDS = {
  sessions: 859260,
  venues: 859259,
  openSeats: 859262,
} as const;

function buildAuthHeader(user: TelegramUser): string {
  return `TelegramAuth ${btoa(JSON.stringify(user))}`;
}

async function fetchTableData(
  host: string,
  tableId: number,
  user: TelegramUser,
): Promise<unknown[]> {
  const res = await fetch(`${host}/api/thirdseat/data/${tableId}`, {
    headers: {
      Authorization: buildAuthHeader(user),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to load table ${tableId}: ${res.status}`);
  }
  const body = await res.json();
  return Array.isArray(body.results) ? body.results : [];
}

export async function loadDashboardData(
  host: string,
  user: TelegramUser,
): Promise<{
  sessions: unknown[];
  venues: unknown[];
  openSeats: unknown[];
}> {
  const [sessions, venues, openSeats] = await Promise.all([
    fetchTableData(host, TABLE_IDS.sessions, user),
    fetchTableData(host, TABLE_IDS.venues, user),
    fetchTableData(host, TABLE_IDS.openSeats, user),
  ]);
  return { sessions, venues, openSeats };
}
