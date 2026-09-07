import { mailtoFor, type RequestPayload } from "@/lib/request";
import { EMAIL, PARTNERS_EMAIL } from "@/lib/site";
import { trackRequest } from "@/lib/analytics";

export async function sendRequest(
  payload: RequestPayload,
): Promise<{ ok: true; cashCode?: string } | { ok: false; mailto: string }> {
  const to = payload.kind === "partner" ? PARTNERS_EMAIL : EMAIL;
  try {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      cashCode?: string;
      fallback?: string;
      to?: string;
      subject?: string;
      body?: string;
    };
    if (data.ok) {
      // Counted here rather than in each form: every request on the site —
      // tour, transfer, contact, partner, custom day, photography — goes
      // through this one function, so a new form is measured by existing.
      trackRequest(payload.kind, {
        experience: payload.slug,
        guests: payload.guests,
        pay_cash: payload.payCash === true,
      });
      return { ok: true, cashCode: data.cashCode };
    }
    if (data.fallback === "mailto") {
      const subject = encodeURIComponent(data.subject || "");
      const body = encodeURIComponent(data.body || "");
      return { ok: false, mailto: `mailto:${data.to || to}?subject=${subject}&body=${body}` };
    }
  } catch {
    /* open a draft */
  }
  return { ok: false, mailto: mailtoFor(payload, to) };
}
