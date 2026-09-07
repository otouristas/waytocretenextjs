/**
 * Conversion events.
 *
 * GA4 was installed and measured pageviews only, which tells you that traffic
 * arrived and nothing about whether it did anything. The three actions worth
 * counting on this site are the three ways a guest starts a conversation: a
 * request form, a WhatsApp tap and a phone tap.
 *
 * `track` is deliberately silent when gtag is absent — a blocked script, a
 * preview build, a test — because analytics must never be able to break a
 * booking form it is only observing.
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagParams) => void;
  }
}

export function track(event: string, params: GtagParams = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* never let measurement throw into the thing being measured */
  }
}

/** A request form was accepted by the desk. `kind` is the RequestPayload kind. */
export function trackRequest(kind: string, extra: GtagParams = {}) {
  track("request_submitted", { kind, ...extra });
}
