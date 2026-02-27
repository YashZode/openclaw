import { motion } from "framer-motion";
import { MapPin, Clock, FileText, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import type { BaserowVenue } from "../../hooks/useBaserow";
import { updateRow, TABLES } from "../../lib/baserow";

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

interface VenueProfileProps {
  venue: BaserowVenue;
}

type FeedbackType = "success" | "error" | null;

export default function VenueProfile({ venue }: VenueProfileProps) {
  const [name, setName] = useState(venue.name || "");
  const [address, setAddress] = useState(venue.address || "");
  const [neighborhood, setNeighborhood] = useState(venue.neighborhood || "");
  const [hours, setHours] = useState(venue.hours || "");
  const [notes, setNotes] = useState(venue.Notes || "");
  const [communityMode, setCommunityMode] = useState(venue.community_mode);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const showFeedback = (type: FeedbackType, msg: string) => {
    setFeedback(type);
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedback(null);
      setFeedbackMsg("");
    }, 3000);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateRow(TABLES.venues, venue.id, {
        name: name.trim(),
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        hours: hours.trim(),
        Notes: notes.trim(),
        community_mode: communityMode,
      });
      showFeedback("success", "Venue profile saved");
    } catch (err) {
      console.error("[3rdSeat] Save failed:", err);
      showFeedback("error", "Failed to save — try again");
    } finally {
      setSaving(false);
    }
  }, [venue.id, name, address, neighborhood, hours, notes, communityMode]);

  const handleToggleCommunity = () => setCommunityMode((prev) => !prev);

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {/* Community mode toggle (prominent) */}
      <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              COMMUNITY MODE
            </span>
            <p className="font-sans text-xs text-navy-400 mt-1">
              {communityMode
                ? "Your venue is visible in discovery feeds and gets priority matching."
                : "Enable to appear in discovery feeds and boost your venue score."}
            </p>
          </div>
          <button onClick={handleToggleCommunity} className="flex items-center gap-2.5 group">
            <div
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                communityMode ? "bg-cyan/30" : "bg-navy-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200 shadow-md ${
                  communityMode ? "left-[30px] bg-cyan" : "left-0.5 bg-navy-500"
                }`}
              />
            </div>
            <span
              className={`font-mono text-xs font-semibold ${communityMode ? "text-cyan" : "text-navy-500"}`}
            >
              {communityMode ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Editable fields */}
      <motion.div
        variants={item}
        className="rounded-xl card-paper shadow-paper p-5 flex flex-col gap-5"
      >
        <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
          VENUE DETAILS
        </span>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
            <FileText className="w-3 h-3" />
            VENUE NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30"
            placeholder="e.g. The Coffee Lab"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
            <MapPin className="w-3 h-3" />
            ADDRESS
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30"
            placeholder="123 Main St"
          />
        </div>

        {/* Neighborhood */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
            <MapPin className="w-3 h-3" />
            NEIGHBORHOOD
          </label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30"
            placeholder="e.g. Downtown"
          />
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
            <Clock className="w-3 h-3" />
            HOURS
          </label>
          <input
            type="text"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30"
            placeholder="Mon-Fri 08:00-18:00, Sat 09:00-14:00"
          />
          <span className="font-sans text-[10px] text-navy-600">
            Format: Mon-Fri 08:00-18:00, Sat 09:00-14:00, Sun closed
          </span>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy-500">
            <FileText className="w-3 h-3" />
            NOTES
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30 resize-none"
            placeholder="Anything guests should know..."
          />
        </div>
      </motion.div>

      {/* Save button + feedback */}
      <motion.div variants={item} className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan/10 text-cyan font-mono text-xs font-semibold hover:bg-cyan/20 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1.5 font-sans text-xs ${
              feedback === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {feedback === "success" ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
