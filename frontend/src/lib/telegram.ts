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
