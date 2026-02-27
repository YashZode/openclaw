import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Star, Wifi, Zap, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const page = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function VenueDiscovery() {
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
        <span className="font-sans text-lg font-semibold text-white">Spots Found</span>
        <div className="w-[50px] h-5" />
      </div>

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4 flex-1 px-6 py-2"
      >
        {/* AI Note */}
        <motion.div
          variants={item}
          className="flex items-center gap-2.5 w-full rounded-lg bg-cyan/10 py-3 px-4"
        >
          <Sparkles className="w-4 h-4 text-cyan" />
          <span className="font-sans text-[13px] text-cyan">
            AI found 3 spots matching your needs
          </span>
        </motion.div>

        {/* Venue 1 - Featured */}
        <motion.button
          variants={item}
          whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/hang/1")}
          className="flex flex-col w-full rounded-xl card-paper shadow-paper overflow-hidden text-left"
        >
          <div className="w-full h-[140px] bg-navy-700 flex items-center justify-center">
            <span className="text-navy-500 text-xs font-mono">venue photo</span>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between w-full">
              <span className="font-sans text-base font-semibold text-white">
                Coffee &amp; Code
              </span>
              <div className="flex items-center gap-1 bg-slate-deep rounded px-2 py-1">
                <Star className="w-3 h-3 text-cyan fill-cyan" />
                <span className="font-mono text-xs font-semibold text-cyan">4.8</span>
              </div>
            </div>
            <span className="font-sans text-[13px] text-navy-400">0.3 mi · 2300 S Lamar Blvd</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan bg-cyan-dim rounded-full py-1 px-2.5">
                <Wifi className="w-3 h-3" /> 85 Mbps
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan bg-cyan-dim rounded-full py-1 px-2.5">
                <Zap className="w-3 h-3" /> 12 outlets
              </span>
            </div>
          </div>
        </motion.button>

        {/* Venue 2 */}
        <motion.button
          variants={item}
          whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/hang/2")}
          className="flex flex-col w-full rounded-xl card-paper shadow-paper overflow-hidden text-left"
        >
          <div className="w-full h-[120px] bg-navy-700 flex items-center justify-center">
            <span className="text-navy-500 text-xs font-mono">venue photo</span>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between w-full">
              <span className="font-sans text-base font-semibold text-white">
                Houndstooth Coffee
              </span>
              <div className="flex items-center gap-1 bg-slate-deep rounded px-2 py-1">
                <Star className="w-3 h-3 text-white" />
                <span className="font-mono text-xs font-semibold text-white">4.5</span>
              </div>
            </div>
            <span className="font-sans text-[13px] text-navy-400">0.8 mi · 401 Congress Ave</span>
          </div>
        </motion.button>

        {/* Venue 3 - Compact */}
        <motion.div
          variants={item}
          className="flex items-center w-full rounded-xl card-paper shadow-paper p-4 gap-3"
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="font-sans text-base font-semibold text-white">Spokesman</span>
            <span className="font-sans text-[13px] text-navy-400">1.2 mi · 1122 E 6th St</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-navy-400" />
              <span className="font-sans text-xs text-navy-400">4.3</span>
            </div>
          </div>
        </motion.div>

        {/* Vote hint */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-deep py-3 px-4"
        >
          <Info className="w-3.5 h-3.5 text-navy-500" />
          <span className="font-sans text-[13px] text-navy-500">Tap a venue to cast your vote</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
