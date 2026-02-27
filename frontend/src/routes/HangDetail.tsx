import { motion } from "framer-motion";
import {
  ChevronLeft,
  Radio,
  CircleCheck,
  Timer,
  Wifi,
  Zap,
  Volume2,
  Users,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function HangDetail() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen bg-navy-900 relative z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 text-navy-400" />
          <span className="font-sans text-sm text-navy-400">Back</span>
        </motion.button>
        <span className="font-sans text-lg font-semibold text-white">Coffee &amp; Code</span>
        <div className="w-[50px] h-5" />
      </div>

      {/* Venue Info */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3 px-6"
      >
        <motion.div
          variants={item}
          className="w-full h-[160px] rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden"
        >
          <span className="text-navy-500 text-xs font-mono">venue photo</span>
        </motion.div>
        <motion.div variants={item} className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-lg font-semibold text-white">Coffee &amp; Code</span>
            <span className="font-sans text-[13px] text-navy-400">
              2300 S Lamar Blvd, Austin TX
            </span>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5 rounded-md bg-cyan-dim py-1.5 px-3"
          >
            <Radio className="w-3.5 h-3.5 text-cyan" />
            <span className="font-mono text-[11px] font-semibold text-cyan">LIVE</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Crew Section */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3 px-6 py-4"
      >
        <motion.span
          variants={item}
          className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]"
        >
          CREW · 3/5 CONFIRMED
        </motion.span>

        {[
          { initial: "C", name: "carl", info: "Organizer · confirmed", confirmed: true },
          { initial: "A", name: "alex_dev", info: "confirmed · en route", confirmed: true },
          { initial: "M", name: "maya_ui", info: "pending · invited 12m ago", confirmed: false },
        ].map((member) => (
          <motion.div
            key={member.name}
            variants={item}
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 w-full rounded-[10px] card-paper shadow-ink py-3 px-4"
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full ${member.confirmed ? "bg-cyan-mid" : "bg-navy-600"}`}
            >
              <span
                className={`font-mono text-sm font-semibold ${member.confirmed ? "text-cyan" : "text-navy-400"}`}
              >
                {member.initial}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="font-sans text-sm font-semibold text-white">{member.name}</span>
              <span className="font-sans text-xs text-navy-400">{member.info}</span>
            </div>
            {member.confirmed ? (
              <CircleCheck className="w-5 h-5 text-cyan" />
            ) : (
              <Timer className="w-5 h-5 text-navy-500" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Live Status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-3 px-6 py-2"
      >
        <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
          LIVE STATUS
        </span>
        <div className="flex flex-col gap-2.5 w-full rounded-[10px] card-paper shadow-paper p-4">
          {[
            {
              icon: <Wifi className="w-4 h-4 text-navy-400" />,
              label: "WiFi",
              value: "85 Mbps",
              accent: true,
            },
            {
              icon: <Zap className="w-4 h-4 text-navy-400" />,
              label: "Outlets",
              value: "12/16 free",
              accent: false,
            },
            {
              icon: <Volume2 className="w-4 h-4 text-navy-400" />,
              label: "Noise",
              value: "Moderate",
              accent: false,
            },
            {
              icon: <Users className="w-4 h-4 text-navy-400" />,
              label: "Seats",
              value: "8 open",
              accent: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span className="font-sans text-sm text-navy-400">{stat.label}</span>
              </div>
              <span
                className={`font-mono text-sm font-semibold ${stat.accent ? "text-cyan" : "text-white"}`}
              >
                {stat.value}
              </span>
            </div>
          ))}
          <span className="font-sans text-[10px] text-navy-600">Last ping: 12 min ago</span>
        </div>
      </motion.div>

      {/* Fallback */}
      <div className="flex items-center gap-2.5 px-6 py-3">
        <Shield className="w-4 h-4 text-navy-600" />
        <span className="font-sans text-xs text-navy-600">Backup: Houndstooth Coffee (0.8 mi)</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex gap-3 px-6 pt-4 pb-8"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center flex-1 rounded-lg card-paper shadow-ink py-3.5 px-5 btn-press"
        >
          <span className="font-sans text-sm font-semibold text-navy-400">Leave</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(34,211,238,0.15)" }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 flex-1 rounded-lg bg-cyan py-3.5 px-5 shadow-glow btn-press"
        >
          <Radio className="w-4 h-4 text-navy-900" />
          <span className="font-sans text-sm font-semibold text-navy-900">Update Status</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
