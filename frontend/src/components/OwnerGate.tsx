import { Building2, ExternalLink, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useOwnedVenues } from "../hooks/useBaserow";
import { useAuth } from "../lib/auth";

export default function OwnerGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { loading, isOwner } = useOwnedVenues(user?.telegramId);

  const botName = window.location.hostname === "3rdseat.com" ? "thirdSeatbot" : "workhangbot";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-cyan animate-spin" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center card-paper shadow-paper rounded-xl p-8">
          <div className="w-14 h-14 rounded-xl bg-cyan/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-cyan" />
          </div>
          <h2 className="font-sans text-xl font-semibold text-white">Become a Venue Owner</h2>
          <p className="font-sans text-sm text-navy-400 leading-relaxed">
            You need to authenticate your business with the 3rdSeat bot on Telegram.
          </p>
          <a
            href={`https://t.me/${botName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-cyan py-2.5 px-5 shadow-glow btn-press"
          >
            <ExternalLink className="w-4 h-4 text-navy-900" />
            <span className="font-mono text-sm font-semibold text-navy-900">Open @{botName}</span>
          </a>
          <p className="font-sans text-xs text-navy-500">
            The bot will guide you through venue registration and verification.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
