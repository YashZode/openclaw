import { html, nothing } from "lit";
import type { TelegramUser } from "../thirdseat-auth.ts";

export type ThirdSeatDashboardState = {
  telegramUser: TelegramUser;
  dashboardLoading: boolean;
  dashboardError: string | null;
  dashboardSessions: unknown[];
  dashboardVenues: unknown[];
  dashboardOpenSeats: unknown[];
  handleTelegramLogout: () => void;
  switchToControlMode: () => void;
};

function displayName(user: TelegramUser): string {
  const parts = [user.first_name];
  if (user.last_name) {
    parts.push(user.last_name);
  }
  return parts.join(" ");
}

function renderSessionCard(session: Record<string, unknown>) {
  const name = (session["Name"] ?? session["name"] ?? "Untitled") as string;
  const date = (session["Date"] ?? session["date"] ?? "") as string;
  const status = (session["Status"] ?? session["status"] ?? "") as string;
  return html`
    <div class="thirdseat-card">
      <div class="thirdseat-card-title">${name}</div>
      <div class="thirdseat-card-meta">
        ${date ? html`<span>${date}</span>` : nothing}
        ${status ? html`<span>${status}</span>` : nothing}
      </div>
    </div>
  `;
}

function renderVenueCard(venue: Record<string, unknown>) {
  const name = (venue["Name"] ?? venue["name"] ?? "Unnamed Venue") as string;
  const location = (venue["Location"] ?? venue["location"] ?? "") as string;
  const hours = (venue["Hours"] ?? venue["hours"] ?? "") as string;
  return html`
    <div class="thirdseat-card">
      <div class="thirdseat-card-title">${name}</div>
      <div class="thirdseat-card-sub">${location}</div>
      ${hours ? html`<div class="thirdseat-card-meta"><span>${hours}</span></div>` : nothing}
    </div>
  `;
}

function renderSeatCard(seat: Record<string, unknown>) {
  const venue = (seat["Venue"] ?? seat["venue"] ?? "") as string;
  const date = (seat["Date"] ?? seat["date"] ?? "") as string;
  const seats = (seat["Available Seats"] ??
    seat["available_seats"] ??
    seat["Seats"] ??
    "") as string;
  return html`
    <div class="thirdseat-card">
      <div class="thirdseat-card-title">${venue || "Open Seat"}</div>
      <div class="thirdseat-card-meta">
        ${date ? html`<span>${date}</span>` : nothing}
        ${seats ? html`<span>${seats} seats</span>` : nothing}
      </div>
    </div>
  `;
}

export function renderThirdSeatDashboard(state: ThirdSeatDashboardState) {
  const user = state.telegramUser;
  const avatarUrl = user.photo_url || "";

  if (state.dashboardLoading) {
    return html`
      <div class="thirdseat-dashboard">
        ${renderUserBar(user, avatarUrl, state)}
        <div class="thirdseat-loading">Loading dashboard...</div>
      </div>
    `;
  }

  if (state.dashboardError) {
    return html`
      <div class="thirdseat-dashboard">
        ${renderUserBar(user, avatarUrl, state)}
        <div class="thirdseat-content">
          <div class="thirdseat-error">${state.dashboardError}</div>
        </div>
      </div>
    `;
  }

  return html`
    <div class="thirdseat-dashboard">
      ${renderUserBar(user, avatarUrl, state)}
      <div class="thirdseat-content">
        <div class="thirdseat-grid">
          <div class="thirdseat-section">
            <div class="thirdseat-section-title">Upcoming Sessions</div>
            ${
              state.dashboardSessions.length > 0
                ? state.dashboardSessions.map((s) =>
                    renderSessionCard(s as Record<string, unknown>),
                  )
                : html`
                    <div class="thirdseat-empty">No upcoming sessions</div>
                  `
            }
          </div>
          <div class="thirdseat-section">
            <div class="thirdseat-section-title">Available Venues</div>
            ${
              state.dashboardVenues.length > 0
                ? state.dashboardVenues.map((v) => renderVenueCard(v as Record<string, unknown>))
                : html`
                    <div class="thirdseat-empty">No venues found</div>
                  `
            }
          </div>
          <div class="thirdseat-section">
            <div class="thirdseat-section-title">Open Seats</div>
            ${
              state.dashboardOpenSeats.length > 0
                ? state.dashboardOpenSeats.map((s) => renderSeatCard(s as Record<string, unknown>))
                : html`
                    <div class="thirdseat-empty">No open seats</div>
                  `
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUserBar(
  user: TelegramUser,
  avatarUrl: string,
  state: Pick<ThirdSeatDashboardState, "handleTelegramLogout" | "switchToControlMode">,
) {
  return html`
    <div class="thirdseat-user-bar">
      ${
        avatarUrl
          ? html`<img class="thirdseat-user-bar-avatar" src=${avatarUrl} alt="" />`
          : html`
              <div class="thirdseat-user-bar-avatar"></div>
            `
      }
      <span class="thirdseat-user-bar-name">${displayName(user)}</span>
      <div class="thirdseat-user-bar-actions">
        <a @click=${(e: Event) => {
          e.preventDefault();
          state.switchToControlMode();
        }}>
          Admin Panel
        </a>
        <button @click=${() => state.handleTelegramLogout()}>Logout</button>
      </div>
    </div>
  `;
}
