import { createContext, useContext, useState, type ReactNode } from "react";

type Mode = "explorer" | "owner";

interface AppModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

const STORAGE_KEY = "3rdseat_mode";

function getInitial(): Mode {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v === "owner") {
      return "owner";
    }
  } catch {
    /* SSR / restricted */
  }
  return "explorer";
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(getInitial);

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      sessionStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  };

  return <AppModeContext.Provider value={{ mode, setMode }}>{children}</AppModeContext.Provider>;
}

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error("useAppMode must be inside AppModeProvider");
  }
  return ctx;
}
