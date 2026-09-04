import { mailtoFor, type RequestPayload } from "@/lib/request";
import { EMAIL, PARTNERS_EMAIL } from "@/lib/site";

export async function sendRequest(payload: RequestPayload): Promise<{ ok: true } | { ok: false; mailto: string }> {
  const to = payload.kind === "partner" ? PARTNERS_EMAIL : EMAIL;
  try {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok?: boolean; fallback?: string; to?: string; subject?: string; body?: string };
    if (data.ok) return { ok: true };
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
