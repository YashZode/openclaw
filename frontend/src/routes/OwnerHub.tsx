import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  MapPin,
  Loader2,
  AlertCircle,
  PenTool,
} from "lucide-react";
import { useState, useMemo } from "react";
import Analytics from "../components/owner/Analytics";
import Dashboard from "../components/owner/Dashboard";
import Team from "../components/owner/Team";
import VenueProfile from "../components/owner/VenueProfile";
import Whiteboard from "../components/owner/Whiteboard";
import { useOwnedVenues, useVenueSessions, useVenueOpenSeats } from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";

type Tab = "dashboard" | "analytics" | "team" | "venue" | "board";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "team", label: "Team", icon: Users },
  { id: "venue", label: "Venue", icon: Building2 },
  { id: "board", label: "Board", icon: PenTool },
];

export default function OwnerHub() {
  const { user } = useAuth();
  const telegramId = user?.telegramId;

  const { data: venues, loading: venuesLoading, error: venuesError } = useOwnedVenues(telegramId);
  const venueIds = useMemo(() => venues.map((v) => v.id), [venues]);
  const { data: sessions, loading: sessionsLoading } = useVenueSessions(venueIds);
  const { data: openSeats, loading: seatsLoading } = useVenueOpenSeats(venueIds);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const venue = venues[0];

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

  if (!venue) {
    return (
      <div className="flex flex-col items-center gap-3 py-32 text-center px-6">
        <Building2 className="w-8 h-8 text-navy-600" />
        <span className="font-sans text-sm text-navy-500">No venue found</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Venue header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-white truncate">
            {venue.name}
          </h1>
          {venue.community_mode && (
            <span className="font-mono text-[10px] text-cyan bg-cyan-dim px-2 py-0.5 rounded-full shrink-0">
              COMMUNITY
            </span>
          )}
        </div>
        {venue.address && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-navy-500" />
            <span className="font-sans text-sm text-navy-400">{venue.address}</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-cyan/10 text-cyan shadow-glow"
                  : "text-navy-500 hover:text-navy-300 hover:bg-white/[0.02]"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {activeTab === "dashboard" && (
          <Dashboard
            venue={venue}
            sessions={sessions}
            openSeats={openSeats}
            sessionsLoading={sessionsLoading}
            seatsLoading={seatsLoading}
          />
        )}
        {activeTab === "analytics" && (
          <Analytics venue={venue} sessions={sessions} openSeats={openSeats} />
        )}
        {activeTab === "team" && <Team venueId={venue.id} ownerUsername={user?.username} />}
        {activeTab === "venue" && <VenueProfile venue={venue} />}
        {activeTab === "board" && <Whiteboard venueId={venue.id} />}
      </motion.div>
    </motion.div>
  );
}
