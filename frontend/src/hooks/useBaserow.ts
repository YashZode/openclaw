import { useState, useEffect } from "react";
import { fetchRows, TABLES, type BaserowResponse } from "../lib/baserow";

// Generic hook for fetching Baserow table rows
function useQuery<T>(
  table: number,
  opts?: { filters?: Record<string, string>; search?: string; size?: number; enabled?: boolean },
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = opts?.enabled ?? true;
  const filterKey = opts?.filters ? JSON.stringify(opts.filters) : "";
  const search = opts?.search ?? "";
  const size = opts?.size ?? 50;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRows<T>({ table, filters: opts?.filters, search, size })
      .then((res: BaserowResponse<T>) => {
        if (!cancelled) {
          setData(res.results);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [table, filterKey, search, size, enabled]);

  return { data, loading, error };
}

// --- Typed table interfaces ---

export interface BaserowVenue {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: string | number | null;
  lon: string | number | null;
  hours: string;
  community_mode: boolean;
  owner_telegram_id: string;
  Notes: string;
  created_at: string;
}

export interface BaserowSession {
  id: number;
  user_telegram_id: string;
  venue_id: { id: number; value: string }[];
  requested_time: string;
  status: string;
  notes: string;
  guest_requested: string | number;
  Active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BaserowUser {
  id: number;
  email: string;
  user_telegram_id: string;
  preferred_neighborhood: string;
  role: string;
  prefrences: string;
  created_at: string;
}

export interface BaserowOpenSeat {
  id: number;
  status: string;
  venue_id: { id: number; value: string }[];
  session_id: { id: number; value: string }[];
  broadcaster_telegram_id: string;
  neighborhood: string;
  window_end: string;
  created_at: string;
}

export interface BaserowCommunityStanding {
  id: number;
  user_telegram_id: string;
  standing: string;
  flag_count: number;
  created_at: string;
}

// --- Hooks ---

export function useVenues(opts?: { enabled?: boolean }) {
  return useQuery<BaserowVenue>(TABLES.venues, { size: 100, ...opts });
}

export function useSessions(telegramId?: string) {
  // Baserow filter: field 7415688 = user_telegram_id
  const filters = telegramId ? { filter__field_7415688__equal: telegramId } : undefined;

  return useQuery<BaserowSession>(TABLES.sessions, {
    filters,
    size: 50,
    enabled: true,
  });
}

export function useUserSessions(telegramId: string | undefined) {
  return useQuery<BaserowSession>(TABLES.sessions, {
    filters: telegramId ? { filter__field_7415688__equal: telegramId } : undefined,
    size: 20,
    enabled: !!telegramId,
  });
}

export function useOpenSeats() {
  return useQuery<BaserowOpenSeat>(TABLES.open_seats, {
    filters: { filter__field_7415694__equal: "open" },
    size: 20,
  });
}

export function useCommunityStanding(telegramId: string | undefined) {
  return useQuery<BaserowCommunityStanding>(TABLES.community_standing, {
    filters: telegramId ? { filter__field_7415691__equal: telegramId } : undefined,
    size: 1,
    enabled: !!telegramId,
  });
}

export function useUserProfile(telegramId: string | undefined) {
  return useQuery<BaserowUser>(TABLES.users, {
    filters: telegramId ? { filter__field_7416457__equal: telegramId } : undefined,
    size: 1,
    enabled: !!telegramId,
  });
}
