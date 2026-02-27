import { html } from "lit";
import { ref } from "lit/directives/ref.js";

export type ThirdSeatLoginState = {
  basePath: string;
  switchToControlMode: () => void;
};

let widgetInjected = false;

function injectTelegramWidget(el: Element | undefined) {
  if (!el || widgetInjected) {
    return;
  }
  widgetInjected = true;

  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.async = true;
  script.setAttribute("data-telegram-login", "3rdSeatbot");
  script.setAttribute("data-size", "large");
  script.setAttribute("data-onauth", "onTelegramAuth(user)");
  script.setAttribute("data-request-access", "write");
  el.appendChild(script);
}

export function resetLoginWidget() {
  widgetInjected = false;
}

export function renderThirdSeatLogin(state: ThirdSeatLoginState) {
  const logoSrc = state.basePath ? `${state.basePath}/favicon.svg` : "/favicon.svg";

  return html`
    <div class="thirdseat-login">
      <div class="thirdseat-brand">
        <div class="thirdseat-brand-logo">
          <img src=${logoSrc} alt="3rdSeat" />
        </div>
        <div class="thirdseat-brand-title">3rdSeat</div>
        <div class="thirdseat-brand-sub">Co-working session booking</div>
      </div>
      <div class="thirdseat-login-widget" ${ref((el) => injectTelegramWidget(el))}></div>
      <div class="thirdseat-login-footer">
        <a @click=${(e: Event) => {
          e.preventDefault();
          state.switchToControlMode();
        }}>
          Admin Panel
        </a>
      </div>
    </div>
  `;
}
