import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Armchair,
  Check,
  X,
  Loader2,
  TrendingUp,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import type { BaserowVenue, BaserowSession, BaserowOpenSeat } from "../../hooks/useBaserow";
import { updateRow, TABLES } from "../../lib/baserow";

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    denied: "text-red-400 bg-red-400/10",
    open: "text-cyan bg-cyan-dim",
  };
  return (
    <span
      className={`font-mono text-[11px] font-semibold px-3 py-1 rounded-full ${colors[status] || "text-navy-400 bg-navy-700"}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

interface DashboardProps {
  venue: BaserowVenue;
  sessions: BaserowSession[];
  openSeats: BaserowOpenSeat[];
  sessionsLoading: boolean;
  seatsLoading: boolean;
}

export default function Dashboard({
  venue,
  sessions,
  openSeats,
  sessionsLoading,
  seatsLoading,
}: DashboardProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [communityMode, setCommunityMode] = useState(venue.community_mode);
  const [togglingCommunity, setTogglingCommunity] = useState(false);

  const pendingSessions = useMemo(() => sessions.filter((s) => s.status === "pending"), [sessions]);
  const approvedSessions = useMemo(
    () => sessions.filter((s) => s.status === "approved"),
    [sessions],
  );
  const deniedSessions = useMemo(() => sessions.filter((s) => s.status === "denied"), [sessions]);
  const activeSeats = useMemo(() => openSeats.filter((s) => s.status === "open"), [openSeats]);

  const approvalRate = useMemo(() => {
    const decided = approvedSessions.length + deniedSessions.length;
    return decided > 0 ? Math.round((approvedSessions.length / decided) * 100) : 100;
  }, [approvedSessions, deniedSessions]);

  const venueScore = useMemo(() => {
    let score = 50;
    if (communityMode) {
      score += 15;
    }
    if (approvalRate > 80) {
      score += 15;
    }
    if (activeSeats.length > 0) {
      score += 10;
    }
    if (sessions.length > 5) {
      score += 10;
    }
    return Math.min(score, 100);
  }, [communityMode, approvalRate, activeSeats, sessions]);

  const handleUpdateSession = useCallback(
    async (session: BaserowSession, newStatus: "approved" | "denied") => {
      setUpdatingId(session.id);
      try {
        await updateRow(TABLES.sessions, session.id, { status: newStatus });
        window.location.reload();
      } catch (err) {
        console.error("[3rdSeat] Session update failed:", err);
        setUpdatingId(null);
      }
    },
    [],
  );

  const handleToggleCommunity = useCallback(async () => {
    setTogglingCommunity(true);
    try {
      const newMode = !communityMode;
      await updateRow(TABLES.venues, venue.id, { community_mode: newMode });
      setCommunityMode(newMode);
    } catch (err) {
      console.error("[3rdSeat] Community mode toggle failed:", err);
    } finally {
      setTogglingCommunity(false);
    }
  }, [communityMode, venue.id]);

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5"
    >
      {/* Venue header with community toggle */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-bold text-white">{venue.name}</h2>
          {venue.neighborhood && (
            <span className="font-mono text-[10px] text-navy-400 bg-navy-800 px-2 py-0.5 rounded mt-1 inline-block">
              {venue.neighborhood}
            </span>
          )}
        </div>
        <button
          onClick={handleToggleCommunity}
          disabled={togglingCommunity}
          className="flex items-center gap-2.5 group"
        >
          <span className="font-mono text-[11px] text-navy-400">COMMUNITY</span>
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              communityMode ? "bg-cyan/30" : "bg-navy-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-md ${
                communityMode ? "left-[22px] bg-cyan" : "left-0.5 bg-navy-500"
              }`}
            />
          </div>
        </button>
      </motion.div>

      {/* 6 KPI cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-white">
              {sessionsLoading ? "..." : sessions.length}
            </span>
            <CalendarDays className="w-4 h-4 text-navy-500" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Sessions</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-green-400">
              {sessionsLoading ? "..." : `${approvalRate}%`}
            </span>
            <TrendingUp className="w-4 h-4 text-green-400/50" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Approval Rate</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-cyan">
              {seatsLoading ? "..." : activeSeats.length}
            </span>
            <Armchair className="w-4 h-4 text-cyan/50" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Open Seats</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-yellow-400">
              {sessionsLoading ? "..." : pendingSessions.length}
            </span>
            <Clock className="w-4 h-4 text-yellow-400/50" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Pending</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-purple-400">
              {sessionsLoading ? "..." : `$${sessions.length * 12}`}
            </span>
            <Zap className="w-4 h-4 text-purple-400/50" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Revenue Est</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[24px] font-bold text-amber-400">{venueScore}</span>
            <Star className="w-4 h-4 text-amber-400/50" />
          </div>
          <span className="font-sans text-[10px] text-navy-500">Venue Score</span>
        </div>
      </motion.div>

      {/* Pending session requests */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-yellow-400" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            PENDING REQUESTS
          </span>
          <span className="font-mono text-[11px] text-navy-600">({pendingSessions.length})</span>
        </div>

        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-cyan animate-spin" />
          </div>
        ) : pendingSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-xl card-paper shadow-ink">
            <Target className="w-5 h-5 text-navy-600" />
            <span className="font-sans text-[13px] text-navy-600">All caught up</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl card-paper shadow-paper p-4"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-semibold text-white truncate">
                      User {s.user_telegram_id}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    {s.requested_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-navy-500" />
                        <span className="font-mono text-xs text-navy-500">{s.requested_time}</span>
                      </div>
                    )}
                    {s.notes && (
                      <span className="font-sans text-xs text-navy-500 truncate">{s.notes}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpdateSession(s, "approved")}
                    disabled={updatingId === s.id}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpdateSession(s, "denied")}
                    disabled={updatingId === s.id}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active open seats */}
      <motion.div variants={item} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Armchair className="w-4 h-4 text-cyan" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            ACTIVE OPEN SEATS
          </span>
          <span className="font-mono text-[11px] text-navy-600">({activeSeats.length})</span>
        </div>

        {seatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-cyan animate-spin" />
          </div>
        ) : activeSeats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-xl card-paper shadow-ink">
            <Armchair className="w-5 h-5 text-navy-600" />
            <span className="font-sans text-[13px] text-navy-600">No active open seats</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activeSeats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center gap-3 rounded-lg card-paper shadow-ink p-3"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0">
                  <Armchair className="w-4 h-4 text-cyan" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="font-sans text-sm font-medium text-white truncate">
                    {seat.venue_id?.[0]?.value || "Unknown venue"}
                  </span>
                  <div className="flex items-center gap-2">
                    {seat.neighborhood && (
                      <span className="font-sans text-xs text-navy-500">{seat.neighborhood}</span>
                    )}
                    {seat.window_end && (
                      <span className="font-mono text-[10px] text-navy-600">
                        until{" "}
                        {new Date(seat.window_end).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={seat.status} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
