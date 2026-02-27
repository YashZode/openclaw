import { Coffee, Compass, LogOut, Shield, User } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCommunityStanding } from "../hooks/useBaserow";
import { useAppMode } from "../lib/appMode";
import { useAuth } from "../lib/auth";
import Logo from "./Logo";

export default function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, setMode } = useAppMode();
  const { data: standing } = useCommunityStanding(user?.telegramId);
  const userStanding = standing[0];

  const isExplorer = mode === "explorer";
  const currentPath = location.pathname;

  const handleModeSwitch = (m: "explorer" | "owner") => {
    setMode(m);
    if (m === "explorer") {
      navigate("/home");
    } else {
      navigate("/owner");
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 paper-grain relative">
      {/* ── Desktop header ── */}
      <header className="border-b border-white/[0.04] bg-slate-deep/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo + mode toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size={28} className="text-cyan" />
              <span className="font-mono text-lg font-bold text-white">3rdSeat</span>
            </div>

            {/* Mode toggle pill */}
            <div className="hidden sm:flex items-center rounded-full bg-navy-800 p-0.5">
              <button
                onClick={() => handleModeSwitch("explorer")}
                className={`px-3 py-1 rounded-full font-mono text-xs font-semibold transition-colors ${
                  isExplorer ? "bg-cyan text-navy-900" : "text-navy-400 hover:text-white"
                }`}
              >
                Explorer
              </button>
              <button
                onClick={() => handleModeSwitch("owner")}
                className={`px-3 py-1 rounded-full font-mono text-xs font-semibold transition-colors ${
                  !isExplorer ? "bg-cyan text-navy-900" : "text-navy-400 hover:text-white"
                }`}
              >
                Owner
              </button>
            </div>

            {/* Explorer sub-nav (desktop) */}
            {isExplorer && (
              <nav className="hidden md:flex items-center gap-1 ml-2">
                <button
                  onClick={() => navigate("/home")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    currentPath === "/home"
                      ? "bg-cyan/10 text-cyan"
                      : "text-navy-400 hover:text-white transition-colors"
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span className="font-mono text-xs font-semibold">HOME</span>
                </button>
                <button
                  onClick={() => navigate("/discover")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    currentPath === "/discover"
                      ? "bg-cyan/10 text-cyan"
                      : "text-navy-400 hover:text-white transition-colors"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="font-mono text-xs font-medium">DISCOVER</span>
                </button>
              </nav>
            )}
          </div>

          {/* Right: standing badge, avatar, logout */}
          <div className="flex items-center gap-3">
            {userStanding && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800">
                <Shield className="w-3.5 h-3.5 text-cyan" />
                <span className="font-mono text-[11px] text-navy-400">{userStanding.standing}</span>
              </div>
            )}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors"
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center">
                  <span className="font-mono text-xs text-navy-400">
                    {user?.firstName?.[0] || "?"}
                  </span>
                </div>
              )}
              <span className="hidden sm:block font-sans text-sm text-navy-400">
                {user?.firstName || "User"}
              </span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="p-1.5 rounded-lg text-navy-600 hover:text-navy-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      {children}

      {/* ── Mobile bottom area ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-deep border-t border-white/[0.04]">
        {/* Mode toggle row */}
        <div className="flex items-center justify-center px-6 py-2 border-b border-white/[0.04]">
          <div className="flex items-center rounded-full bg-navy-800 p-0.5">
            <button
              onClick={() => handleModeSwitch("explorer")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold transition-colors ${
                isExplorer ? "bg-cyan text-navy-900" : "text-navy-400"
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => handleModeSwitch("owner")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold transition-colors ${
                !isExplorer ? "bg-cyan text-navy-900" : "text-navy-400"
              }`}
            >
              Owner
            </button>
          </div>
        </div>

        {/* Explorer sub-nav tabs (mobile) */}
        {isExplorer && (
          <div className="flex items-center justify-around px-6 py-3">
            <button onClick={() => navigate("/home")} className="flex flex-col items-center gap-1">
              <Coffee
                className={`w-[22px] h-[22px] ${currentPath === "/home" ? "text-cyan" : "text-navy-600"}`}
              />
              <span
                className={`font-mono text-[10px] ${currentPath === "/home" ? "font-semibold text-cyan" : "font-medium text-navy-600"}`}
              >
                HOME
              </span>
            </button>
            <button
              onClick={() => navigate("/discover")}
              className="flex flex-col items-center gap-1"
            >
              <Compass
                className={`w-[22px] h-[22px] ${currentPath === "/discover" ? "text-cyan" : "text-navy-600"}`}
              />
              <span
                className={`font-mono text-[10px] ${currentPath === "/discover" ? "font-semibold text-cyan" : "font-medium text-navy-600"}`}
              >
                DISCOVER
              </span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center gap-1"
            >
              <User
                className={`w-[22px] h-[22px] ${currentPath === "/profile" ? "text-cyan" : "text-navy-600"}`}
              />
              <span
                className={`font-mono text-[10px] ${currentPath === "/profile" ? "font-semibold text-cyan" : "font-medium text-navy-600"}`}
              >
                PROFILE
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
