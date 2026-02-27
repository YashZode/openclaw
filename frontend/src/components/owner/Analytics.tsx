import { motion } from "framer-motion";
import { TrendingUp, Lightbulb, Award, Clock, Zap, Users, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BaserowVenue, BaserowSession, BaserowOpenSeat } from "../../hooks/useBaserow";

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const CYAN = "#22D3EE";
const GREEN = "#4ADE80";
const YELLOW = "#FACC15";
const RED = "#F87171";
const PURPLE = "#C084FC";
const NAVY_600 = "#475569";

interface AnalyticsProps {
  venue: BaserowVenue;
  sessions: BaserowSession[];
  openSeats: BaserowOpenSeat[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-lg card-paper shadow-paper-lg px-3 py-2 border border-white/[0.06]">
      <p className="font-mono text-[10px] text-navy-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-xs text-white">
          {p.name}: <span className="text-cyan font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function Analytics({ venue, sessions, openSeats }: AnalyticsProps) {
  // --- Compute chart data ---

  // Sessions over time (last 14 days + 7-day prediction)
  const sessionsOverTime = useMemo(() => {
    const now = new Date();
    const days: { date: string; sessions?: number; predicted?: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const count = sessions.filter((s) => {
        const created = new Date(s.created_at);
        return created >= dayStart && created < dayEnd;
      }).length;

      days.push({ date: dateStr, sessions: count });
    }

    // 7-day prediction (simple linear trend)
    const recentAvg = days.slice(-7).reduce((sum, d) => sum + (d.sessions || 0), 0) / 7;
    const olderAvg = days.slice(0, 7).reduce((sum, d) => sum + (d.sessions || 0), 0) / 7;
    const growthRate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0.05;

    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const predicted = Math.max(0, Math.round(recentAvg * (1 + growthRate * (i / 7))));
      days.push({ date: dateStr, predicted });
    }

    return days;
  }, [sessions]);

  // Status breakdown (pie chart)
  const statusBreakdown = useMemo(() => {
    const approved = sessions.filter((s) => s.status === "approved").length;
    const pending = sessions.filter((s) => s.status === "pending").length;
    const denied = sessions.filter((s) => s.status === "denied").length;
    return [
      { name: "Approved", value: approved, color: GREEN },
      { name: "Pending", value: pending, color: YELLOW },
      { name: "Denied", value: denied, color: RED },
    ].filter((s) => s.value > 0);
  }, [sessions]);

  // Peak hours (bar chart)
  const peakHours = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => 0);
    sessions.forEach((s) => {
      if (s.requested_time) {
        const match = s.requested_time.match(/(\d{1,2}):/);
        if (match) {
          hours[parseInt(match[1])] += 1;
        }
      } else if (s.created_at) {
        const h = new Date(s.created_at).getHours();
        hours[h] += 1;
      }
    });
    return hours
      .map((count, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        sessions: count,
      }))
      .filter((_, i) => i >= 6 && i <= 23); // 6 AM - 11 PM
  }, [sessions]);

  // Growth projection (line chart)
  const growthProjection = useMemo(() => {
    const weeks: { week: string; actual?: number; projected?: number }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      const label = `W-${i}`;

      const count = sessions.filter((s) => {
        const created = new Date(s.created_at);
        return created >= weekStart && created < weekEnd;
      }).length;

      weeks.push({ week: label === "W-0" ? "This Wk" : label, actual: count });
    }

    const lastActual = weeks[weeks.length - 1]?.actual || 0;
    for (let i = 1; i <= 4; i++) {
      weeks.push({
        week: `W+${i}`,
        projected: Math.round(lastActual * (1 + 0.08 * i)),
      });
    }

    return weeks;
  }, [sessions]);

  // --- Computed insights ---
  const approvedCount = sessions.filter((s) => s.status === "approved").length;
  const deniedCount = sessions.filter((s) => s.status === "denied").length;
  const decidedCount = approvedCount + deniedCount;
  const approvalRate = decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 100;

  const activeSeats = openSeats.filter((s) => s.status === "open").length;

  const recentWeekSessions = sessions.filter((s) => {
    const created = new Date(s.created_at);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return created >= weekAgo;
  }).length;

  const olderWeekSessions = sessions.filter((s) => {
    const created = new Date(s.created_at);
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return created >= twoWeeksAgo && created < weekAgo;
  }).length;

  const growthPct =
    olderWeekSessions > 0
      ? Math.round(((recentWeekSessions - olderWeekSessions) / olderWeekSessions) * 100)
      : recentWeekSessions > 0
        ? 100
        : 0;

  // Peak hour
  const peakHourData = peakHours.reduce(
    (max, h) => (h.sessions > max.sessions ? h : max),
    peakHours[0] || { hour: "N/A", sessions: 0 },
  );

  // Venue score
  const venueScore = useMemo(() => {
    let score = 50;
    if (venue.community_mode) {
      score += 15;
    }
    if (approvalRate > 80) {
      score += 15;
    }
    if (activeSeats > 0) {
      score += 10;
    }
    if (sessions.length > 5) {
      score += 10;
    }
    return Math.min(score, 100);
  }, [venue.community_mode, approvalRate, activeSeats, sessions.length]);

  const dynamicInsights = useMemo(() => {
    const insights: { icon: typeof TrendingUp; title: string; text: string; color: string }[] = [];

    insights.push({
      icon: TrendingUp,
      title: "Growth Momentum",
      text:
        growthPct > 0
          ? `+${growthPct}% week-over-week growth. Your venue is trending upward.`
          : growthPct === 0
            ? "Stable session volume. Consider promotions to boost traffic."
            : `${growthPct}% decline. Try adjusting hours or enabling community mode.`,
      color:
        growthPct > 0 ? "text-green-400" : growthPct === 0 ? "text-yellow-400" : "text-red-400",
    });

    if (peakHourData.sessions > 0) {
      insights.push({
        icon: Clock,
        title: "Peak Hour Optimization",
        text: `Most sessions at ${peakHourData.hour}. Staff accordingly and consider extending hours around this window.`,
        color: "text-cyan",
      });
    }

    const seatUtilization =
      sessions.length > 0 ? Math.round((activeSeats / Math.max(sessions.length, 1)) * 100) : 0;
    insights.push({
      icon: Zap,
      title: "Seat Utilization",
      text:
        seatUtilization > 50
          ? `${seatUtilization}% utilization — strong engagement. Keep broadcasting seats.`
          : `${seatUtilization}% utilization — room to grow. Broadcast more open seats to attract guests.`,
      color: seatUtilization > 50 ? "text-green-400" : "text-yellow-400",
    });

    if (venue.community_mode) {
      insights.push({
        icon: Users,
        title: "Community Mode Impact",
        text: "Community mode is ON — your venue appears in discovery feeds and gets priority matching.",
        color: "text-cyan",
      });
    } else {
      insights.push({
        icon: Users,
        title: "Community Mode",
        text: "Enable community mode to appear in discovery feeds and boost your venue score by +15 points.",
        color: "text-navy-400",
      });
    }

    return insights;
  }, [growthPct, peakHourData, activeSeats, sessions.length, venue.community_mode]);

  const strategyCards = [
    {
      icon: Users,
      title: "Network Effect",
      text: `Each approved session brings ~2.3x referral potential. Your ${approvedCount} approvals could generate ${Math.round(approvedCount * 2.3)} referrals.`,
    },
    {
      icon: Zap,
      title: "Revenue Per Seat",
      text: `Estimated $${sessions.length > 0 ? Math.round((sessions.length * 12) / Math.max(activeSeats, 1)) : 0}/seat based on current volume. Industry avg: $18/seat.`,
    },
    {
      icon: TrendingUp,
      title: "Community Flywheel",
      text: venue.community_mode
        ? "Your venue gets 3x visibility in search. Community venues average 40% more sessions."
        : "Enable community mode for 3x visibility boost in venue discovery.",
    },
    {
      icon: Award,
      title: "Fast Responder Badge",
      text: "Venues responding within 15 min earn a Fast Responder badge, increasing booking rate by 28%.",
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {/* Venue Score */}
      <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              VENUE SCORE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-4xl font-bold text-white">{venueScore}</span>
              <span className="font-mono text-sm text-navy-500">/100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-[3px] border-navy-700 relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={CYAN}
                strokeWidth="3"
                strokeDasharray={`${(venueScore / 100) * 175.9} 175.9`}
                strokeLinecap="round"
                opacity={0.8}
              />
            </svg>
            <Award className="w-6 h-6 text-cyan" />
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Approval", value: `${approvalRate}%`, ok: approvalRate > 80 },
            {
              label: "Community",
              value: venue.community_mode ? "ON" : "OFF",
              ok: venue.community_mode,
            },
            { label: "Seats", value: String(activeSeats), ok: activeSeats > 0 },
            { label: "Volume", value: String(sessions.length), ok: sessions.length > 5 },
          ].map((f) => (
            <div
              key={f.label}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono ${
                f.ok ? "bg-green-400/10 text-green-400" : "bg-navy-700 text-navy-400"
              }`}
            >
              <span>{f.label}:</span>
              <span className="font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sessions Over Time */}
        <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-cyan" />
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              SESSIONS OVER TIME
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionsOverTime}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CYAN} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke={CYAN}
                  fill="url(#cyanGrad)"
                  strokeWidth={2}
                  name="Actual"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke={CYAN}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  name="Predicted"
                  opacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-cyan" />
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              STATUS BREAKDOWN
            </span>
          </div>
          <div className="h-48 flex items-center justify-center">
            {statusBreakdown.length === 0 ? (
              <span className="font-sans text-sm text-navy-600">No session data yet</span>
            ) : (
              <div className="flex items-center gap-6 w-full">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-mono text-xs text-navy-400">{s.name}</span>
                      <span className="font-mono text-xs font-semibold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-cyan" />
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              PEAK HOURS
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="sessions"
                  fill={CYAN}
                  radius={[3, 3, 0, 0]}
                  opacity={0.8}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Growth Projection */}
        <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan" />
            <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
              GROWTH PROJECTION
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthProjection}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: NAVY_600 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={CYAN}
                  strokeWidth={2}
                  dot={{ fill: CYAN, r: 3 }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={PURPLE}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ fill: PURPLE, r: 3 }}
                  name="Projected"
                  opacity={0.7}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Strategic Insights */}
      <motion.div variants={item} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            STRATEGIC INSIGHTS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dynamicInsights.map((insight, i) => (
            <div key={i} className="rounded-xl card-paper shadow-paper p-4 flex gap-3">
              <div className={`shrink-0 mt-0.5 ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-semibold text-white">{insight.title}</span>
                <span className="font-sans text-xs text-navy-400 leading-relaxed">
                  {insight.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strategy Cards */}
      <motion.div variants={item} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            GROWTH STRATEGY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategyCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl card-paper shadow-ink p-4 flex gap-3 border border-white/[0.02]"
            >
              <div className="shrink-0 mt-0.5 text-purple-400/70">
                <card.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-semibold text-white">{card.title}</span>
                <span className="font-sans text-xs text-navy-400 leading-relaxed">{card.text}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
