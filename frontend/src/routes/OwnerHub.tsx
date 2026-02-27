import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Armchair,
  MapPin,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import {
  useOwnedVenues,
  useVenueSessions,
  useVenueOpenSeats,
  type BaserowSession,
} from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";
import { updateRow, TABLES } from "../lib/baserow";

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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

export default function OwnerHub() {
  const { user } = useAuth();
  const telegramId = user?.telegramId;

  const { data: venues, loading: venuesLoading, error: venuesError } = useOwnedVenues(telegramId);

  const venueIds = useMemo(() => venues.map((v) => v.id), [venues]);

  const { data: sessions, loading: sessionsLoading } = useVenueSessions(venueIds);

  const { data: openSeats, loading: seatsLoading } = useVenueOpenSeats(venueIds);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const pendingSessions = sessions.filter((s) => s.status === "pending");
  const approvedSessions = sessions.filter((s) => s.status === "approved");
  const activeSeats = openSeats.filter((s) => s.status === "open");

  const handleUpdateSession = useCallback(
    async (session: BaserowSession, newStatus: "approved" | "denied") => {
      setUpdatingId(session.id);
      try {
        await updateRow(TABLES.sessions, session.id, { status: newStatus });
        // Force re-render — the hook will re-fetch on next mount, but we do an optimistic local update
        window.location.reload();
      } catch (err) {
        console.error("[3rdSeat] Session update failed:", err);
        setUpdatingId(null);
      }
    },
    [],
  );

  const venue = venues[0]; // Primary venue

  if (venuesLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-cyan animate-spin" />
      </div>
    );
  }

  if (venuesError) {
    return (
      <div className="flex items-center gap-2 text-red-400 font-sans text-sm py-4 px-6 mx-6 mt-8 rounded-lg bg-red-400/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{venuesError}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8"
    >
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        {/* Venue header */}
        {venue && (
          <motion.div variants={item} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-2xl font-bold text-white">{venue.name}</h1>
              {venue.community_mode && (
                <span className="font-mono text-[10px] text-cyan bg-cyan-dim px-2 py-0.5 rounded-full">
                  COMMUNITY
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {venue.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-navy-500" />
                  <span className="font-sans text-sm text-navy-400">{venue.address}</span>
                </div>
              )}
              {venue.neighborhood && (
                <span className="font-mono text-[10px] text-navy-400 bg-navy-800 px-2 py-0.5 rounded">
                  {venue.neighborhood}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats cards */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-white">
              {sessionsLoading ? "..." : sessions.length}
            </span>
            <span className="font-sans text-[11px] text-navy-500">Total Sessions</span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-yellow-400">
              {sessionsLoading ? "..." : pendingSessions.length}
            </span>
            <span className="font-sans text-[11px] text-navy-500">Pending</span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-green-400">
              {sessionsLoading ? "..." : approvedSessions.length}
            </span>
            <span className="font-sans text-[11px] text-navy-500">Approved</span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-cyan">
              {seatsLoading ? "..." : activeSeats.length}
            </span>
            <span className="font-sans text-[11px] text-navy-500">Open Seats</span>
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
            <div className="flex flex-col items-center gap-2 py-8 px-4 rounded-xl card-paper shadow-ink">
              <CalendarDays className="w-6 h-6 text-navy-600" />
              <span className="font-sans text-[13px] text-navy-600">No pending requests</span>
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
                          <span className="font-mono text-xs text-navy-500">
                            {s.requested_time}
                          </span>
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
            <div className="flex flex-col items-center gap-2 py-8 px-4 rounded-xl card-paper shadow-ink">
              <Armchair className="w-6 h-6 text-navy-600" />
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

        {/* Venue info card */}
        {venue && (
          <motion.div
            variants={item}
            className="flex flex-col gap-3 rounded-[10px] card-paper shadow-paper p-4"
          >
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              VENUE INFO
            </span>
            {venue.hours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-navy-400" />
                  <span className="font-sans text-sm text-navy-400">Hours</span>
                </div>
                <span className="font-mono text-sm text-white">{venue.hours}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-navy-400">Community Mode</span>
              <span
                className={`font-mono text-sm font-semibold ${venue.community_mode ? "text-cyan" : "text-navy-500"}`}
              >
                {venue.community_mode ? "ON" : "OFF"}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
