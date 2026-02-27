import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { fetchRows, createRow, TABLES } from "./baserow";
import { sendWelcomeMessage } from "./telegram";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AppUser {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  baserowRowId?: number;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (tgUser: TelegramUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "3rdseat_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (tgUser: TelegramUser) => {
    const telegramId = String(tgUser.id);

    // Check if user exists in Baserow
    const existing = await fetchRows<{ id: number; user_telegram_id: string }>({
      table: TABLES.users,
      search: telegramId,
      size: 1,
    });

    let baserowRowId: number | undefined;

    if (existing.results.length > 0 && existing.results[0].user_telegram_id === telegramId) {
      baserowRowId = existing.results[0].id;
    } else {
      // Create user record
      const created = await createRow<{ id: number }>(TABLES.users, {
        user_telegram_id: telegramId,
        email: "",
        role: "browsing",
      });
      baserowRowId = created.id;
    }

    const appUser: AppUser = {
      telegramId,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      baserowRowId,
    };

    setUser(appUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));

    // Fire-and-forget welcome message via Telegram bot (non-blocking)
    void sendWelcomeMessage(telegramId, tgUser.first_name);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be inside AuthProvider");
  }
  return ctx;
}
