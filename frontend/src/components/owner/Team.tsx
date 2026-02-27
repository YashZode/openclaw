import { motion } from "framer-motion";
import { Users, Shield, UserPlus, Trash2, ChevronDown } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

type AccessLevel = "admin" | "manager" | "staff";

interface TeamMember {
  id: string;
  username: string;
  role: AccessLevel;
  joinedAt: string;
}

const ROLE_CONFIG: Record<AccessLevel, { label: string; color: string; desc: string }> = {
  admin: {
    label: "Admin",
    color: "text-cyan bg-cyan-dim",
    desc: "Full venue management, team, approve/deny",
  },
  manager: {
    label: "Manager",
    color: "text-purple-400 bg-purple-400/10",
    desc: "Approve/deny sessions, view analytics",
  },
  staff: {
    label: "Staff",
    color: "text-navy-400 bg-navy-700",
    desc: "View-only analytics",
  },
};

function getStorageKey(venueId: number) {
  return `3rdseat_team_${venueId}`;
}

function loadTeam(venueId: number): TeamMember[] {
  try {
    const raw = localStorage.getItem(getStorageKey(venueId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTeam(venueId: number, team: TeamMember[]) {
  localStorage.setItem(getStorageKey(venueId), JSON.stringify(team));
}

interface TeamProps {
  venueId: number;
  ownerUsername?: string;
}

export default function Team({ venueId, ownerUsername }: TeamProps) {
  const [team, setTeam] = useState<TeamMember[]>(() => loadTeam(venueId));
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<AccessLevel>("staff");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const totalMembers = useMemo(() => team.length + 1, [team]); // +1 for owner

  const handleInvite = useCallback(() => {
    const username = inviteUsername.trim().replace(/^@/, "");
    if (!username) {
      return;
    }

    if (team.some((m) => m.username.toLowerCase() === username.toLowerCase())) {
      return;
    }

    const newMember: TeamMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username,
      role: inviteRole,
      joinedAt: new Date().toISOString(),
    };

    const updated = [...team, newMember];
    setTeam(updated);
    saveTeam(venueId, updated);
    setInviteUsername("");
    setInviteRole("staff");
  }, [inviteUsername, inviteRole, team, venueId]);

  const handleRemove = useCallback(
    (memberId: string) => {
      const updated = team.filter((m) => m.id !== memberId);
      setTeam(updated);
      saveTeam(venueId, updated);
      setConfirmDelete(null);
    },
    [team, venueId],
  );

  const handleRoleChange = useCallback(
    (memberId: string, newRole: AccessLevel) => {
      const updated = team.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
      setTeam(updated);
      saveTeam(venueId, updated);
      setRoleDropdown(null);
    },
    [team, venueId],
  );

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            TEAM MEMBERS
          </span>
          <span className="font-mono text-[11px] text-navy-600">({totalMembers})</span>
        </div>
      </motion.div>

      {/* Owner row (always first, non-removable) */}
      <motion.div variants={item} className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl card-paper shadow-paper p-4">
          <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-semibold text-white truncate">
                @{ownerUsername || "you"}
              </span>
              <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-semibold">
                OWNER
              </span>
            </div>
            <span className="font-sans text-xs text-navy-500">Full control over venue</span>
          </div>
        </div>

        {/* Team members */}
        {team.map((member) => {
          const roleConf = ROLE_CONFIG[member.role];
          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-xl card-paper shadow-paper p-4"
            >
              <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center shrink-0">
                <span className="font-mono text-sm text-navy-400">
                  {member.username[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-semibold text-white truncate">
                    @{member.username}
                  </span>
                </div>
                <span className="font-sans text-xs text-navy-500">
                  Joined{" "}
                  {new Date(member.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Role selector */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdown(roleDropdown === member.id ? null : member.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${roleConf.color}`}
                >
                  {roleConf.label.toUpperCase()}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {roleDropdown === member.id && (
                  <div className="absolute right-0 top-8 z-10 w-40 rounded-lg card-paper shadow-paper-lg border border-white/[0.06] py-1">
                    {(Object.keys(ROLE_CONFIG) as AccessLevel[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(member.id, role)}
                        className={`w-full text-left px-3 py-2 hover:bg-white/[0.04] transition-colors ${
                          member.role === role ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] font-semibold ${ROLE_CONFIG[role].color.split(" ")[0]}`}
                        >
                          {ROLE_CONFIG[role].label}
                        </span>
                        <p className="font-sans text-[10px] text-navy-500 mt-0.5">
                          {ROLE_CONFIG[role].desc}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Remove button */}
              {confirmDelete === member.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="font-mono text-[10px] text-red-400 bg-red-400/10 px-2 py-1 rounded hover:bg-red-400/20 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="font-mono text-[10px] text-navy-400 px-2 py-1 rounded hover:bg-navy-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(member.id)}
                  className="p-1.5 rounded-lg text-navy-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Invite form */}
      <motion.div variants={item} className="rounded-xl card-paper shadow-paper p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-cyan" />
          <span className="font-mono text-[11px] font-semibold text-navy-500 tracking-[2px]">
            INVITE MEMBER
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="font-mono text-[10px] text-navy-500 mb-1 block">
              TELEGRAM USERNAME
            </label>
            <input
              type="text"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              placeholder="@username"
              className="w-full input-paper rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-navy-600 focus:outline-none focus:ring-1 focus:ring-cyan/30"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>

          <div className="w-full sm:w-36">
            <label className="font-mono text-[10px] text-navy-500 mb-1 block">ACCESS LEVEL</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AccessLevel)}
              className="w-full input-paper rounded-lg px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 appearance-none cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInvite}
              disabled={!inviteUsername.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-cyan/10 text-cyan font-mono text-xs font-semibold hover:bg-cyan/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Invite
            </motion.button>
          </div>
        </div>

        {/* Access level descriptions */}
        <div className="mt-4 flex flex-col gap-1.5">
          {(Object.keys(ROLE_CONFIG) as AccessLevel[]).map((role) => (
            <div key={role} className="flex items-center gap-2">
              <span
                className={`font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded ${ROLE_CONFIG[role].color}`}
              >
                {ROLE_CONFIG[role].label}
              </span>
              <span className="font-sans text-[10px] text-navy-500">{ROLE_CONFIG[role].desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
