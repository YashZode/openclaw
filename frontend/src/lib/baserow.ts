const BASE = "/baserow/table";

export interface BaserowResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface FetchOptions {
  table: number;
  filters?: Record<string, string>;
  search?: string;
  size?: number;
  page?: number;
  orderBy?: string;
}

export async function fetchRows<T>(opts: FetchOptions): Promise<BaserowResponse<T>> {
  const params = new URLSearchParams({ user_field_names: "true" });
  if (opts.size) {
    params.set("size", String(opts.size));
  }
  if (opts.page) {
    params.set("page", String(opts.page));
  }
  if (opts.search) {
    params.set("search", opts.search);
  }
  if (opts.orderBy) {
    params.set("order_by", opts.orderBy);
  }
  if (opts.filters) {
    for (const [key, val] of Object.entries(opts.filters)) {
      params.set(key, val);
    }
  }

  const res = await fetch(`${BASE}/${opts.table}/?${params}`);
  if (!res.ok) {
    throw new Error(`Baserow ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRow<T>(table: number, rowId: number): Promise<T> {
  const res = await fetch(`${BASE}/${table}/${rowId}/?user_field_names=true`);
  if (!res.ok) {
    throw new Error(`Baserow ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function createRow<T>(table: number, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}/${table}/?user_field_names=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Baserow ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function updateRow<T>(
  table: number,
  rowId: number,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE}/${table}/${rowId}/?user_field_names=true`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Baserow ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// Table IDs
export const TABLES = {
  venues: 859259,
  sessions: 859260,
  community_standing: 859261,
  open_seats: 859262,
  owner_feedback: 859263,
  seat_matches: 859265,
  email_verifications: 859266,
  users: 859352,
} as const;
