import { motion } from "framer-motion";
import { MapPin, Clock, Users, FileText, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useVenues, type BaserowSession, type BaserowVenue } from "../hooks/useBaserow";
import { fetchRow, TABLES } from "../lib/baserow";

const page = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
};

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
  };
  return (
    <span
      className={`font-mono text-[11px] font-semibold px-3 py-1 rounded-full ${colors[status] || "text-navy-400 bg-navy-700"}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default function HangDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<BaserowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: venues } = useVenues();

  useEffect(() => {
    if (!id) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRow<BaserowSession>(TABLES.sessions, parseInt(id, 10))
      .then((data) => {
        if (!cancelled) {
          setSession(data);
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
  }, [id]);

  const venue: BaserowVenue | undefined = session?.venue_id?.[0]
    ? venues.find((v) => v.id === session.venue_id[0].id)
    : undefined;

  const venueName = session?.venue_id?.[0]?.value || "Unknown venue";

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen bg-navy-900 relative z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-center px-6 py-4">
        <span className="font-sans text-lg font-semibold text-white">
          {loading ? "Loading..." : venueName}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyan animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-400 font-sans text-sm py-4 px-6 mx-6 rounded-lg bg-red-400/5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : session ? (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4 px-6"
        >
          {/* Venue header */}
          <motion.div variants={item} className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <span className="font-sans text-lg font-semibold text-white">{venueName}</span>
              {venue?.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-navy-500" />
                  <span className="font-sans text-[13px] text-navy-400">{venue.address}</span>
                </div>
              )}
            </div>
            <StatusBadge status={session.status} />
          </motion.div>

          {/* Session details */}
          <motion.div
            variants={item}
            className="flex flex-col gap-3 w-full rounded-[10px] card-paper shadow-paper p-4"
          >
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              SESSION DETAILS
            </span>

            {session.requested_time && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-navy-400" />
                  <span className="font-sans text-sm text-navy-400">Requested Time</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white">
                  {session.requested_time}
                </span>
              </div>
            )}

            {Number(session.guest_requested) > 0 && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-navy-400" />
                  <span className="font-sans text-sm text-navy-400">Guests</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white">
                  {session.guest_requested}
                </span>
              </div>
            )}

            {session.notes && (
              <div className="flex items-start gap-2 w-full">
                <FileText className="w-4 h-4 text-navy-400 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-sm text-navy-400">Notes</span>
                  <span className="font-sans text-sm text-white">{session.notes}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full pt-1 border-t border-white/[0.04]">
              <span className="font-sans text-xs text-navy-600">Created</span>
              <span className="font-mono text-xs text-navy-500">
                {session.created_at
                  ? new Date(session.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </div>
          </motion.div>

          {/* Venue info if available */}
          {venue && (
            <motion.div
              variants={item}
              className="flex flex-col gap-3 w-full rounded-[10px] card-paper shadow-paper p-4"
            >
              <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
                VENUE INFO
              </span>
              {venue.neighborhood && (
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-navy-400">Neighborhood</span>
                  <span className="font-mono text-sm text-white">{venue.neighborhood}</span>
                </div>
              )}
              {venue.hours && (
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-navy-400">Hours</span>
                  <span className="font-mono text-sm text-white">{venue.hours}</span>
                </div>
              )}
              {venue.community_mode && (
                <span className="self-start text-[10px] uppercase tracking-wider bg-cyan-500/20 text-cyan-300 rounded-full px-2 py-0.5">
                  Community Mode
                </span>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : null}

      <div className="flex-1" />
    </motion.div>
  );
}
