import { motion } from "framer-motion";
import { Coffee, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen bg-navy-900 relative z-10"
    >
      {/* Header */}
      <div className="flex items-center px-6 py-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 text-navy-400" />
          <span className="font-sans text-sm text-navy-400">Back</span>
        </motion.button>
      </div>

      {/* Profile Header */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-4 px-6 pt-4 pb-6"
      >
        <motion.div
          variants={item}
          className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-cyan-dim"
        >
          <span className="font-mono text-[28px] font-bold text-cyan">C</span>
        </motion.div>
        <motion.h1 variants={item} className="font-sans text-[22px] font-semibold text-white">
          carl
        </motion.h1>
        <motion.span variants={item} className="font-mono text-[13px] text-navy-500">
          @carl_codes
        </motion.span>

        {/* Stats */}
        <motion.div variants={item} className="flex gap-3 w-full pt-2">
          {[
            { value: "47", label: "Hangs", accent: true },
            { value: "12", label: "Venues", accent: false },
            { value: "4.9", label: "Rating", accent: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 flex-1 rounded-[10px] card-paper shadow-paper py-4 px-3"
            >
              <span
                className={`font-mono text-xl font-bold ${stat.accent ? "text-cyan" : "text-white"}`}
              >
                {stat.value}
              </span>
              <span className="font-sans text-[11px] text-navy-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Past Hangs */}
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
          RECENT HANGS
        </motion.span>

        {[
          { name: "Coffee & Code", meta: "Today · 3 crew · 2h 15m", link: "/hang/1" },
          { name: "Houndstooth Focus", meta: "Yesterday · 2 crew · 3h", link: null },
          { name: "Spokesman Sprint", meta: "Feb 24 · 4 crew · 4h", link: null },
        ].map((hang) => (
          <motion.button
            key={hang.name}
            variants={item}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => hang.link && navigate(hang.link)}
            className="flex items-center gap-3 w-full rounded-[10px] card-paper shadow-ink py-3.5 px-4 text-left btn-press"
          >
            <Coffee className="w-5 h-5 text-cyan" />
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="font-sans text-sm font-semibold text-white">{hang.name}</span>
              <span className="font-sans text-xs text-navy-400">{hang.meta}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
