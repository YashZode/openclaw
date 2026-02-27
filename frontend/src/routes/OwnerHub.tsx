import { motion } from "framer-motion";
import { ChevronLeft, Radio, Wifi, Zap, Volume2, Users, RefreshCw } from "lucide-react";
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

export default function OwnerHub() {
  const navigate = useNavigate();

  const weeklyData = [
    { day: "M", value: 32, highlight: false },
    { day: "T", value: 28, highlight: false },
    { day: "W", value: 41, highlight: false },
    { day: "T", value: 47, highlight: true },
    { day: "F", value: 0, highlight: false },
    { day: "S", value: 0, highlight: false },
    { day: "S", value: 0, highlight: false },
  ];
  const maxVal = Math.max(...weeklyData.map((d) => d.value), 1);

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
        <span className="font-sans text-lg font-semibold text-white">Owner Hub</span>
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 rounded-full bg-cyan-dim py-1.5 px-3"
        >
          <Radio className="w-3.5 h-3.5 text-cyan" />
          <span className="font-mono text-[11px] font-semibold text-cyan">LIVE</span>
        </motion.div>
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col flex-1"
      >
        {/* Venue Info */}
        <motion.div variants={item} className="flex flex-col gap-1 px-6 py-2 pb-4">
          <h1 className="font-sans text-[22px] font-bold text-white">Coffee &amp; Code</h1>
          <span className="font-sans text-[13px] text-navy-500">2300 S Lamar Blvd, Austin TX</span>
        </motion.div>

        {/* Metrics Label */}
        <motion.span
          variants={item}
          className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px] px-6"
        >
          TODAY'S PERFORMANCE
        </motion.span>

        {/* Metrics Grid Row 1 */}
        <motion.div variants={item} className="flex gap-3 px-6 py-2">
          <div className="flex flex-col gap-1.5 flex-1 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-cyan">47</span>
            <span className="font-sans text-[11px] text-navy-500">Visits Today</span>
            <span className="font-mono text-[10px] text-cyan">+12% vs last Thu</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-white">4.8</span>
            <span className="font-sans text-[11px] text-navy-500">Avg Rating</span>
            <span className="font-mono text-[10px] text-navy-400">23 reviews</span>
          </div>
        </motion.div>

        {/* Metrics Grid Row 2 */}
        <motion.div variants={item} className="flex gap-3 px-6">
          <div className="flex flex-col gap-1.5 flex-1 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-white">312</span>
            <span className="font-sans text-[11px] text-navy-500">This Week</span>
            <span className="font-mono text-[10px] text-cyan">+8% weekly growth</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 rounded-[10px] card-paper shadow-paper py-3.5 px-4">
            <span className="font-mono text-[28px] font-bold text-white">$2.4k</span>
            <span className="font-sans text-[11px] text-navy-500">Est. Revenue</span>
            <span className="font-mono text-[10px] text-navy-400">from 3rdSeat traffic</span>
          </div>
        </motion.div>

        {/* Weekly Traffic Chart */}
        <motion.div variants={item} className="flex flex-col gap-2.5 px-6 py-4">
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            WEEKLY TRAFFIC
          </span>
          <div className="flex items-end gap-1.5 w-full rounded-[10px] card-paper shadow-paper p-4 pb-3">
            {weeklyData.map((d, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "bottom" }}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <span className="font-mono text-[10px] text-navy-400">{d.value || ""}</span>
                <div
                  className={`w-full rounded-sm ${d.highlight ? "bg-cyan shadow-glow" : "bg-navy-600"}`}
                  style={{ height: `${Math.max((d.value / maxVal) * 80, 4)}px` }}
                />
                <span
                  className={`font-mono text-[10px] ${d.highlight ? "text-cyan font-semibold" : "text-navy-500"}`}
                >
                  {d.day}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Venue Status */}
        <motion.div variants={item} className="flex flex-col gap-2.5 px-6 py-2">
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            VENUE STATUS
          </span>
          <div className="flex flex-col gap-2.5 w-full rounded-[10px] card-paper shadow-paper p-3.5">
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
                value: "12/16",
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
                label: "Open Seats",
                value: "8",
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
          </div>
        </motion.div>

        {/* Recent Check-ins */}
        <motion.div variants={item} className="flex flex-col gap-2.5 px-6 py-2">
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            RECENT CHECK-INS
          </span>
          {[
            { initial: "A", name: "alex_dev", meta: "12 min ago · crew of 3" },
            { initial: "M", name: "maya_ui", meta: "45 min ago · solo" },
          ].map((checkin) => (
            <div
              key={checkin.name}
              className="flex items-center gap-3 w-full rounded-[10px] card-paper shadow-ink py-3 px-4"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-mid">
                <span className="font-mono text-xs font-semibold text-cyan">{checkin.initial}</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="font-sans text-sm font-semibold text-white">{checkin.name}</span>
                <span className="font-sans text-xs text-navy-400">{checkin.meta}</span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="flex-1" />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex gap-3 px-6 pt-4 pb-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center flex-1 rounded-lg card-paper shadow-ink py-3.5 px-5 btn-press"
          >
            <span className="font-sans text-sm font-semibold text-navy-400">Edit Venue</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(34,211,238,0.15)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 flex-1 rounded-lg bg-cyan py-3.5 px-5 shadow-glow btn-press"
          >
            <RefreshCw className="w-4 h-4 text-navy-900" />
            <span className="font-sans text-sm font-semibold text-navy-900">Update Status</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
