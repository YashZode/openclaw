export async function sendWelcomeMessage(chatId: string, firstName: string): Promise<void> {
  try {
    const res = await fetch("/tg/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Hey ${firstName}! Welcome to 3rdSeat.\n\nYou've linked your account from the web. I'm your AI assistant — type /start anytime to explore venues and work sessions nearby.`,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      console.debug("[3rdSeat] Welcome message not sent:", res.status);
    }
  } catch {
    // Network error — silently ignore, web auth still works
  }
}

export interface VenueInfo {
  name: string;
  address: string;
  neighborhood: string;
  hours: string;
  community_mode: boolean;
  owner_telegram_id: string;
  notes: string;
}

export async function sendVenueInfo(userChatId: string, venue: VenueInfo): Promise<void> {
  const lines = [`📍 <b>${venue.name}</b>`, `${venue.neighborhood}, ${venue.address}`];
  if (venue.hours) {
    lines.push(`Hours: ${venue.hours}`);
  }
  lines.push(`Community Mode: ${venue.community_mode ? "Yes" : "No"}`);
  if (venue.notes) {
    lines.push(`Notes: ${venue.notes}`);
  }
  lines.push("", "Type /start to explore more venues.");

  try {
    const res = await fetch("/tg/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userChatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      console.debug("[3rdSeat] Venue info not sent:", res.status);
    }
  } catch {
    // silently ignore
  }
}

export async function requestSession(
  userChatId: string,
  userName: string,
  venue: VenueInfo,
): Promise<void> {
  // Notify venue owner
  if (venue.owner_telegram_id) {
    try {
      await fetch("/tg/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: venue.owner_telegram_id,
          text: `🔔 New session request!\n\n${userName} wants to work at <b>${venue.name}</b>.\nCheck 3rdSeat to approve.`,
          parse_mode: "HTML",
        }),
      });
    } catch {
      // silently ignore
    }
  }

  // Confirm to user
  try {
    const res = await fetch("/tg/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userChatId,
        text: `✅ Session request sent to <b>${venue.name}</b>!\n\nThe venue owner will review your request. You'll be notified when they respond.`,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      console.debug("[3rdSeat] Session request confirmation not sent:", res.status);
    }
  } catch {
    // silently ignore
  }
}
