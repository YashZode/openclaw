import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Clock, Wifi, Zap, Volume2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const page = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function CreateHang() {
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
        <span className="font-mono text-lg font-bold text-cyan">/work</span>
        <div className="w-[50px] h-5" />
      </div>

      {/* Form Content */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 flex-1 p-6"
      >
        <motion.p variants={item} className="font-sans text-sm text-navy-400 leading-relaxed">
          Start a new work hang. AI will find the best spots near you.
        </motion.p>

        {/* Location Field */}
        <motion.div variants={item} className="flex flex-col gap-2 w-full">
          <label className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            LOCATION
          </label>
          <div className="flex items-center gap-2.5 w-full rounded-lg input-paper py-3.5 px-4">
            <MapPin className="w-[18px] h-[18px] text-navy-500" />
            <input
              type="text"
              placeholder="Bay View, Austin TX"
              className="flex-1 bg-transparent font-sans text-sm text-white placeholder:text-navy-500 outline-none"
            />
          </div>
        </motion.div>

        {/* Time Field */}
        <motion.div variants={item} className="flex flex-col gap-2 w-full">
          <label className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            TIME
          </label>
          <div className="flex items-center gap-2.5 w-full rounded-lg input-paper py-3.5 px-4">
            <Clock className="w-[18px] h-[18px] text-navy-500" />
            <input
              type="text"
              placeholder="Today, 2:00 – 5:00 PM"
              className="flex-1 bg-transparent font-sans text-sm text-white placeholder:text-navy-500 outline-none"
            />
          </div>
        </motion.div>

        {/* Needs Field */}
        <motion.div variants={item} className="flex flex-col gap-2 w-full">
          <label className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            NEEDS
          </label>
          <div className="flex gap-2 w-full flex-wrap">
            {[
              { icon: <Wifi className="w-3.5 h-3.5" />, label: "WiFi", active: true },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Outlets", active: true },
              { icon: <Volume2 className="w-3.5 h-3.5" />, label: "Quiet", active: false },
            ].map((need) => (
              <motion.button
                key={need.label}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 rounded-full py-2 px-4 text-xs font-mono font-semibold btn-press ${
                  need.active ? "bg-cyan-dim text-cyan" : "bg-navy-800 text-navy-500"
                }`}
              >
                {need.icon}
                {need.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Group Size */}
        <motion.div variants={item} className="flex flex-col gap-2 w-full">
          <label className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            GROUP SIZE
          </label>
          <div className="flex items-center gap-2.5 w-full rounded-lg input-paper py-3.5 px-4">
            <span className="font-sans text-sm text-navy-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-navy-500"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="3-5 people"
              className="flex-1 bg-transparent font-sans text-sm text-white placeholder:text-navy-500 outline-none"
            />
          </div>
        </motion.div>

        {/* Find Spots Button */}
        <motion.button
          variants={item}
          whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(34,211,238,0.15)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/discover")}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-cyan py-4 px-5 shadow-glow btn-press"
        >
          <Search className="w-[18px] h-[18px] text-navy-900" />
          <span className="font-mono text-sm font-semibold text-navy-900">Find Spots</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
