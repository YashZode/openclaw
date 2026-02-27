export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const STORAGE_KEY = "thirdseat.auth.v1";
const AUTH_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function loadTelegramAuth(): TelegramUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as TelegramUser;
    if (!parsed || typeof parsed.id !== "number" || typeof parsed.hash !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveTelegramAuth(user: TelegramUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearTelegramAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isTelegramAuthValid(user: TelegramUser): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now - user.auth_date < AUTH_TTL_MS / 1000;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export function registerTelegramCallback(onAuth: (user: TelegramUser) => void): void {
  window.onTelegramAuth = onAuth;
}
