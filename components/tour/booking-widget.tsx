"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Loader2, Minus, Plus, ShieldCheck, TrendingDown } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { PriceModel, ThirdPartyCost } from "@/lib/content/schema";
import { quote, type Party } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { sendRequest } from "@/lib/send-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

/**
 * The booking widget.
 *
 * The one substantial client island on a tour page. It never computes a price
 * itself — every figure comes from `quote()` in lib/pricing, the same function
 * that generates the `Offer` in the page's JSON-LD, so what the guest is shown
 * and what Google indexes cannot diverge.
 */
export function BookingWidget({
  slug,
  title,
  lang,
  price,
  groupMin,
  groupMax,
  cancelFreeHours,
  thirdPartyCosts,
  priceNote,
}: {
  slug: string;
  title: string;
  lang: Lang;
  price: PriceModel;
  groupMin: number;
  groupMax: number;
  cancelFreeHours: number;
  thirdPartyCosts: ThirdPartyCost[];
  priceNote?: string;
}) {
  const ui = t(lang);
  const [adults, setAdults] = useState(Math.max(groupMin, 2));
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hotel, setHotel] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const party: Party = { adults, children, infants: 0 };
  const q = useMemo(() => quote(price, party, date || undefined), [price, adults, children, date]);

  const supportsChildren = price.kind === "adult_child_private";
  const guests = adults + children;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const result = await sendRequest({
      kind: "tour",
      lang,
      slug,
      name,
      email,
      hotel,
      date,
      guests,
      message:
        `${message}\n\n— ${title}, ${adults} adult(s)` +
        (children ? `, ${children} child(ren)` : "") +
        (q.kind === "priced" ? `, indicative total ${formatPrice(lang, q.total)}` : ", price on request"),
    });
    setSending(false);
    if (result.ok) setSent(true);
    else if (result.mailto) window.location.href = result.mailto;
  }

  if (sent) {
    return (
      <aside id="booking-panel" className="rounded-2xl bg-surface p-6 ring-1 ring-line">
        <div className="grid size-11 place-items-center rounded-full bg-olive-50 text-olive-deep">
          <Check className="size-5" />
        </div>
        <p className="mt-4 font-display text-xl text-earth">{ui.requestSent}</p>
        <p className="mt-2 text-sm text-muted">{ui.submitted}</p>
      </aside>
    );
  }

  return (
    <aside
      id="booking-panel"
      className="scroll-mt-28 overflow-hidden rounded-2xl bg-surface ring-1 ring-line"
    >
      {/* Price header */}
      <div className="border-b border-line p-5">
        {q.kind === "priced" ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-earth">
                {formatPrice(lang, q.total)}
              </span>
              <span className="text-sm text-faint">
                {guests} {guests === 1 ? "guest" : "guests"}
              </span>
            </div>
            {q.perPerson != null && guests > 1 ? (
              <p className="mt-1 text-sm text-muted">
                {formatPrice(lang, q.perPerson)} {ui.perPerson}
              </p>
            ) : null}
            {q.deposit != null ? (
              <p className="mt-1 text-xs text-muted">
                {formatPrice(lang, q.deposit)} deposit holds your place
              </p>
            ) : null}
          </>
        ) : (
          <>
            <span className="font-display text-2xl font-semibold text-earth">{ui.onRequest}</span>
            <p className="mt-1 text-sm text-muted">
              {q.reason === "out_of_range"
                ? `Tell us your group size and we will price it.`
                : ui.checkAvail}
            </p>
          </>
        )}

        {/**
         * The tier nudge. On a sliding ladder a larger group is always cheaper
         * per head, so surfacing the next rate is genuinely useful rather than
         * a pressure tactic — the guest saves money by knowing.
         */}
        {q.kind === "priced" && q.nudge ? (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-olive-50 p-2.5 text-xs text-olive-deep">
            <TrendingDown className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Add one more guest and the rate drops to{" "}
              <strong>{formatPrice(lang, q.nudge.newPerPerson)}</strong> {ui.perPerson}.
            </span>
          </p>
        ) : null}

        {priceNote ? <p className="mt-3 text-xs leading-relaxed text-faint">{priceNote}</p> : null}
      </div>

      <form onSubmit={submit} className="grid gap-4 p-5">
        {/* Party */}
        <div className="grid gap-3">
          <Stepper
            label="Adults"
            value={adults}
            min={Math.max(1, groupMin - children)}
            max={groupMax - children}
            onChange={setAdults}
          />
          {supportsChildren ? (
            <Stepper
              label={`Children (${price.childAges[0]}–${price.childAges[1]})`}
              value={children}
              min={0}
              max={groupMax - adults}
              onChange={setChildren}
            />
          ) : null}
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            {ui.selectDate}
          </span>
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-olive" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9"
              required
            />
          </span>
        </label>

        {/* Line items, so the total is never a black box. */}
        {q.kind === "priced" ? (
          <dl className="grid gap-1.5 rounded-lg bg-bg p-3 text-sm">
            {q.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-3 text-muted">
                <dt>
                  {line.label}
                  {line.qty > 1 ? ` × ${line.qty}` : ""}
                </dt>
                <dd>{formatPrice(lang, line.total)}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2 font-semibold text-earth">
              <dt>{ui.total}</dt>
              <dd>{formatPrice(lang, q.total)}</dd>
            </div>
          </dl>
        ) : null}

        {thirdPartyCosts.length > 0 ? (
          <details className="rounded-lg bg-bg p-3 text-sm">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              Payable on the day
            </summary>
            <ul className="mt-2 grid gap-1 text-xs text-muted">
              {thirdPartyCosts.map((cost) => (
                <li key={cost.label} className="flex justify-between gap-3">
                  <span>
                    {cost.label}
                    {cost.optional ? " (optional)" : ""}
                  </span>
                  <span>
                    {cost.amount != null
                      ? `${formatPrice(lang, cost.amount)}${cost.perPerson ? " pp" : ""}`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="grid gap-3">
          <Input placeholder={ui.name} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            type="email"
            placeholder={ui.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input placeholder={ui.hotel} value={hotel} onChange={(e) => setHotel(e.target.value)} />
          <Textarea
            placeholder={ui.message}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" disabled={sending} className="w-full">
          {sending ? <Loader2 className="size-4 animate-spin" /> : null}
          {sending ? ui.sending : ui.bookThis}
        </Button>

        {cancelFreeHours > 0 ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5 text-olive" />
            {ui.freeCancel} · {cancelFreeHours}h
          </p>
        ) : null}
      </form>
    </aside>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      <span className="flex items-center gap-1">
        <StepButton
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          label={`Fewer ${label.toLowerCase()}`}
        >
          <Minus className="size-3.5" />
        </StepButton>
        <span className="w-7 text-center text-sm font-semibold tabular-nums text-earth">{value}</span>
        <StepButton
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          label={`More ${label.toLowerCase()}`}
        >
          <Plus className="size-3.5" />
        </StepButton>
      </span>
    </div>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-8 place-items-center rounded-full ring-1 transition",
        disabled
          ? "cursor-not-allowed text-faint ring-line"
          : "text-olive-deep ring-olive-200 hover:bg-olive-50",
      )}
    >
      {children}
    </button>
  );
}
