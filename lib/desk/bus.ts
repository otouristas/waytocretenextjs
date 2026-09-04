/**
 * A two-message bus between the page and the sitewide desk chrome.
 *
 * `DeskChrome` is mounted once in the layout and owns the chat's open state,
 * while the tour dock is rendered deep inside the page. Rather than lift that
 * state into a provider wrapping every route for the sake of two signals,
 * they travel as window events.
 *
 * `dock` is the important one: the dock and the chrome both want the bottom
 * of a phone screen, and without it a tour page shows WhatsApp twice — once
 * as an orb, once in the dock — on top of each other.
 */

export const DESK_OPEN_CHAT = "desk:open-chat";
export const DESK_DOCK = "desk:dock";

/** Ask the sitewide guest chat to open. */
export function openDeskChat() {
  window.dispatchEvent(new Event(DESK_OPEN_CHAT));
}

/** Tell the chrome whether a page-level dock currently owns the bottom bar. */
export function setDeskDock(active: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(DESK_DOCK, { detail: active }));
}
