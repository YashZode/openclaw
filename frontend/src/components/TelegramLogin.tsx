import { useEffect, useRef } from "react";
import type { TelegramUser } from "../lib/auth";

interface Props {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  size?: "small" | "medium" | "large";
}

export default function TelegramLogin({ botName, onAuth, size = "large" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const callbackName = "__telegram_login_callback";
    (window as unknown as Record<string, unknown>)[callbackName] = (user: TelegramUser) => {
      onAuth(user);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", size);
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");

    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(script);
    }

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };
  }, [botName, onAuth, size]);

  return <div ref={ref} />;
}
