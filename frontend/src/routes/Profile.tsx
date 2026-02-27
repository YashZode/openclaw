import { motion } from "framer-motion";
import { Coffee, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserSessions, useCommunityStanding } from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";

const page = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const telegramId = user?.telegramId;
  const { data: sessions, loading: sessionsLoading } = useUserSessions(telegramId);
  const { data: standing } = useCommunityStanding(telegramId);

  const userStanding = standing[0];
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initial = user?.firstName?.[0]?.toUpperCase() || "?";

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen bg-navy-900 relative z-10"
    >
      {/* Profile Header */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-4 px-6 pt-4 pb-6"
      >
        <motion.div
          variants={item}
          className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-cyan-dim overflow-hidden"
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[28px] font-bold text-cyan">{initial}</span>
          )}
        </motion.div>
        <motion.h1 variants={item} className="font-sans text-[22px] font-semibold text-white">
          {displayName}
        </motion.h1>
        {user?.username && (
          <motion.span variants={item} className="font-mono text-[13px] text-navy-500">
            @{user.username}
          </motion.span>
        )}

        {/* Stats */}
        <motion.div variants={item} className="flex gap-3 w-full pt-2">
          <div className="flex flex-col items-center gap-1 flex-1 rounded-[10px] card-paper shadow-paper py-4 px-3">
            <span className="font-mono text-xl font-bold text-cyan">
              {sessionsLoading ? "..." : sessions.length}
            </span>
            <span className="font-sans text-[11px] text-navy-500">Sessions</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 rounded-[10px] card-paper shadow-paper py-4 px-3">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-white" />
              <span className="font-mono text-xl font-bold text-white">
                {userStanding?.standing || "—"}
              </span>
            </div>
            <span className="font-sans text-[11px] text-navy-500">Standing</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3 px-6 py-2"
      >
        <motion.span
          variants={item}
          className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]"
        >
          RECENT SESSIONS
        </motion.span>

        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-cyan animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 rounded-xl card-paper shadow-ink">
            <Coffee className="w-6 h-6 text-navy-600" />
            <span className="font-sans text-[13px] text-navy-600">No sessions yet</span>
          </div>
        ) : (
          sessions.slice(0, 10).map((s) => (
            <motion.button
              key={s.id}
              variants={item}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/hang/${s.id}`)}
              className="flex items-center gap-3 w-full rounded-[10px] card-paper shadow-ink py-3.5 px-4 text-left btn-press"
            >
              <Coffee className="w-5 h-5 text-cyan" />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="font-sans text-sm font-semibold text-white">
                  {s.venue_id?.[0]?.value || "Unknown venue"}
                </span>
                <span className="font-sans text-xs text-navy-400">
                  {s.status}
                  {s.requested_time ? ` · ${s.requested_time}` : ""}
                </span>
              </div>
            </motion.button>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
