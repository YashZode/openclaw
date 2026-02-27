import { motion } from "framer-motion";
import {
  Coffee,
  Compass,
  MapPin,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  Armchair,
  CalendarDays,
  Radio,
  Hand,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUserSessions,
  useVenues,
  useOpenSeats,
  type BaserowSession,
  type BaserowVenue,
  type BaserowOpenSeat,
} from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";
import { createRow, TABLES } from "../lib/baserow";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-cyan animate-spin" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 font-sans text-sm py-4 px-4 rounded-lg bg-red-400/5">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
  sub,
}: {
  icon: React.ElementType;
  text: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 px-4 rounded-xl card-paper shadow-ink">
      <Icon className="w-6 h-6 text-navy-600" />
      <span className="font-sans text-[13px] text-navy-600">{text}</span>
      {sub && <span className="font-mono text-xs text-navy-500">{sub}</span>}
    </div>
  );
}

function SessionCard({
  session,
  venues,
  onClick,
  onBroadcast,
  broadcastingId,
}: {
  session: BaserowSession;
  venues: BaserowVenue[];
  onClick: () => void;
  onBroadcast?: (session: BaserowSession, venue: BaserowVenue | undefined) => void;
  broadcastingId?: number | null;
}) {
  const venueName = session.venue_id?.[0]?.value || "Unknown venue";
  const venue = venues.find((v) => v.id === session.venue_id?.[0]?.id);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}
      className="flex flex-col gap-3 w-full rounded-xl card-paper shadow-paper p-5 text-left"
    >
      <button onClick={onClick} className="flex flex-col gap-3 w-full text-left">
        <div className="flex items-center justify-between w-full">
          <span className="font-sans text-base font-semibold text-white">{venueName}</span>
          <StatusBadge status={session.status} />
        </div>
        {venue?.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-navy-500" />
            <span className="font-sans text-[13px] text-navy-400">{venue.address}</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          {session.requested_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-navy-500" />
              <span className="font-sans text-xs text-navy-500">{session.requested_time}</span>
            </div>
          )}
          {Number(session.guest_requested) > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-navy-500" />
              <span className="font-sans text-xs text-navy-500">
                {session.guest_requested} guest{Number(session.guest_requested) !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        {session.notes && (
          <p className="font-sans text-xs text-navy-500 line-clamp-2">{session.notes}</p>
        )}
      </button>
      {session.status === "approved" && onBroadcast && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            onBroadcast(session, venue);
          }}
          disabled={broadcastingId === session.id}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-cyan py-2.5 px-4 shadow-glow btn-press disabled:opacity-60"
        >
          <Radio className="w-4 h-4 text-navy-900" />
          <span className="font-mono text-xs font-semibold text-navy-900">
            {broadcastingId === session.id ? "Broadcast Live!" : "Broadcast Open Seat"}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}

function VenueCard({ venue }: { venue: BaserowVenue }) {
  return (
    <motion.div
      variants={item}
      className="flex flex-col gap-2 rounded-xl card-paper shadow-paper p-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-semibold text-white">{venue.name}</span>
        {venue.community_mode && (
          <span className="font-mono text-[10px] text-cyan bg-cyan-dim px-2 py-0.5 rounded-full">
            OPEN
          </span>
        )}
      </div>
      {venue.address && (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-navy-500" />
          <span className="font-sans text-xs text-navy-400 line-clamp-1">{venue.address}</span>
        </div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {venue.neighborhood && (
          <span className="font-mono text-[10px] text-navy-400 bg-navy-800 px-2 py-0.5 rounded">
            {venue.neighborhood}
          </span>
        )}
        {venue.hours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-navy-600" />
            <span className="font-mono text-[10px] text-navy-500 line-clamp-1">{venue.hours}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OpenSeatCard({
  seat,
  venues,
  currentTelegramId,
  onRsvp,
  rsvpSentId,
}: {
  seat: BaserowOpenSeat;
  venues: BaserowVenue[];
  currentTelegramId?: string;
  onRsvp?: (seat: BaserowOpenSeat) => void;
  rsvpSentId?: number | null;
}) {
  const venueName = seat.venue_id?.[0]?.value || "Unknown venue";
  const venue = venues.find((v) => v.id === seat.venue_id?.[0]?.id);
  const isOwnSeat = currentTelegramId && seat.broadcaster_telegram_id === currentTelegramId;

  return (
    <motion.div
      variants={item}
      className="flex items-center gap-3 rounded-lg card-paper shadow-ink p-3"
    >
      <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0">
        <Armchair className="w-4 h-4 text-cyan" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-sans text-sm font-medium text-white truncate">{venueName}</span>
        <div className="flex items-center gap-2">
          {venue?.neighborhood && (
            <span className="font-sans text-xs text-navy-500">{venue.neighborhood}</span>
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
      {!isOwnSeat && onRsvp ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onRsvp(seat)}
          disabled={rsvpSentId === seat.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan text-navy-900 font-mono text-[11px] font-semibold btn-press disabled:opacity-60"
        >
          <Hand className="w-3 h-3" />
          {rsvpSentId === seat.id ? "RSVP Sent!" : "RSVP"}
        </motion.button>
      ) : (
        <StatusBadge status={seat.status} />
      )}
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const telegramId = user?.telegramId;

  const {
    data: sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useUserSessions(telegramId);
  const { data: venues, loading: venuesLoading, error: venuesError } = useVenues();
  const { data: openSeats, loading: seatsLoading } = useOpenSeats();

  const [broadcastingId, setBroadcastingId] = useState<number | null>(null);
  const [rsvpSentId, setRsvpSentId] = useState<number | null>(null);

  const activeSessions = sessions.filter((s) => s.status === "approved" || s.status === "pending");
  const pastSessions = sessions.filter((s) => s.status === "denied");
  const communityVenues = venues.filter((v) => v.community_mode);

  const handleBroadcast = useCallback(
    async (session: BaserowSession, venue: BaserowVenue | undefined) => {
      if (!telegramId) {
        return;
      }
      setBroadcastingId(session.id);
      try {
        const windowEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        await createRow(TABLES.open_seats, {
          status: "open",
          session_id: [session.id],
          venue_id: session.venue_id?.length ? [session.venue_id[0].id] : [],
          broadcaster_telegram_id: telegramId,
          neighborhood: venue?.neighborhood || "",
          window_end: windowEnd,
          created_at: new Date().toISOString(),
        });
        setTimeout(() => setBroadcastingId(null), 2000);
      } catch (err) {
        console.error("[3rdSeat] Broadcast failed:", err);
        setBroadcastingId(null);
      }
    },
    [telegramId],
  );

  const handleRsvp = useCallback(
    async (seat: BaserowOpenSeat) => {
      if (!telegramId) {
        return;
      }
      setRsvpSentId(seat.id);
      try {
        await createRow(TABLES.seat_matches, {
          requester_telegram_id: telegramId,
          open_seat_id: [seat.id],
          status: "pending",
          connect_broadcaster: false,
          connect_requester: false,
          created_at: new Date().toISOString(),
        });
        setTimeout(() => setRsvpSentId(null), 2000);
      } catch (err) {
        console.error("[3rdSeat] RSVP failed:", err);
        setRsvpSentId(null);
      }
    },
    [telegramId],
  );

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-navy-900 relative z-10"
    >
      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting + Quick Actions */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-8"
        >
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-sans text-sm text-navy-400">
                hey, {user?.firstName?.toLowerCase() || "there"}
              </p>
              <h1 className="font-sans text-2xl font-semibold text-white">Your Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/discover")}
                className="flex items-center gap-2 rounded-lg bg-cyan py-2.5 px-5 shadow-glow btn-press"
              >
                <Coffee className="w-4 h-4 text-navy-900" />
                <span className="font-mono text-sm font-semibold text-navy-900">/work</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/discover")}
                className="flex items-center gap-2 rounded-lg card-paper shadow-paper py-2.5 px-5 btn-press"
              >
                <Compass className="w-4 h-4 text-navy-400" />
                <span className="font-mono text-sm font-semibold text-white">Discover</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Dashboard grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column: Sessions */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Active Sessions */}
              <motion.div variants={item} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-cyan" />
                  <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
                    YOUR SESSIONS
                  </span>
                  <span className="font-mono text-[11px] text-navy-600">({sessions.length})</span>
                </div>

                {sessionsLoading ? (
                  <LoadingSpinner />
                ) : sessionsError ? (
                  <ErrorMessage message={sessionsError} />
                ) : activeSessions.length === 0 && pastSessions.length === 0 ? (
                  <EmptyState icon={Coffee} text="No sessions yet" sub="Type /work to start one" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        venues={venues}
                        onClick={() => navigate(`/hang/${session.id}`)}
                        onBroadcast={handleBroadcast}
                        broadcastingId={broadcastingId}
                      />
                    ))}
                    {pastSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        venues={venues}
                        onClick={() => navigate(`/hang/${session.id}`)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Open Seats */}
              <motion.div variants={item} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-cyan" />
                  <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
                    OPEN SEATS
                  </span>
                  <span className="font-mono text-[11px] text-navy-600">({openSeats.length})</span>
                </div>

                {seatsLoading ? (
                  <LoadingSpinner />
                ) : openSeats.length === 0 ? (
                  <EmptyState icon={Armchair} text="No open seats right now" />
                ) : (
                  <div className="flex flex-col gap-2">
                    {openSeats.map((seat) => (
                      <OpenSeatCard
                        key={seat.id}
                        seat={seat}
                        venues={venues}
                        currentTelegramId={telegramId}
                        onRsvp={handleRsvp}
                        rsvpSentId={rsvpSentId}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right column: Venues */}
            <div className="flex flex-col gap-6">
              <motion.div variants={item} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan" />
                  <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
                    VENUES
                  </span>
                  <span className="font-mono text-[11px] text-navy-600">({venues.length})</span>
                </div>

                {venuesLoading ? (
                  <LoadingSpinner />
                ) : venuesError ? (
                  <ErrorMessage message={venuesError} />
                ) : communityVenues.length === 0 && venues.length === 0 ? (
                  <EmptyState icon={MapPin} text="No venues yet" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {(communityVenues.length > 0 ? communityVenues : venues).map((venue) => (
                      <VenueCard key={venue.id} venue={venue} />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
