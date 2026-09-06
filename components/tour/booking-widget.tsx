"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Banknote, Camera, Check, ExternalLink, Loader2, Minus, Plus, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import type { Lang } from "@/lib/i18n/langs";
import { fill } from "@/lib/i18n/langs";
import { t, type UI } from "@/lib/i18n/ui";
import { costLabel } from "@/lib/i18n/costs";
import type { PriceModel, ThirdPartyCost, TourCore } from "@/lib/content/schema";
import { quote, type Party } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { sendRequest } from "@/lib/send-request";
import { bookUrl, catalogUrl } from "@/lib/travelotopos";
import { EMAIL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cashPrice } from "@/lib/cash";
import { seatsLeftOnDeparture } from "@/lib/tour-signals";
import { cn } from "@/lib/cn";

function guideOpsNote(amount: number) {
  return `Private Guide requested: €${amount} — payable to the guide on the day. Do not charge online.`;
}

function quoteLineLabel(ui: UI, label: string): string {
  if (label === "participants") return ui.quoteParticipants;
  if (label === "extra guests") return ui.quoteExtraGuests;
  if (label === "adults") return ui.quoteAdults;
  if (label === "children") return ui.quoteChildren;
  if (label === "private group") return ui.quotePrivateGroup;
  if (label === "per couple") return ui.perCouple;
  if (label === "places") return ui.quotePlaces;
  if (label === "early-bird places") return ui.quoteEarlyBird;
  const band = label.match(/^group of (\d+)–(\d+)$/);
  if (band) return fill(ui.quoteGroupBand, { min: band[1], max: band[2] });
  const upTo = label.match(/^group of up to (\d+)$/);
  if (upTo) return fill(ui.quoteGroupUpTo, { n: upTo[1] });
  const hourly = label.match(/^(\d+(?:\.\d+)?)h private tour$/);
  if (hourly) return fill(ui.quoteHourly, { hours: hourly[1] });
  return label;
}

/**
 * The booking widget.
 *
 * The one substantial client island on a tour page. It never computes a price
 * itself — every figure comes from `quote()` in lib/pricing, the same function
 * that generates the `Offer` in the page's JSON-LD, so what the guest is shown
 * and what Google indexes cannot diverge.
 *
 * The optional private-guide add-on is displayed here but never folded into
 * `quote().total`, the live checkout URL, or structured data. It is paid to
 * the guide on the day.
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
  privateGuide,
  photoshoot,
  priceNote,
  live,
}: {
  slug: string;
  title: string;
  lang: Lang;
  price: PriceModel;
  groupMin: number;
  groupMax: number;
  cancelFreeHours: number;
  thirdPartyCosts: ThirdPartyCost[];
  privateGuide: TourCore["privateGuide"];
  photoshoot: TourCore["photoshoot"];
  priceNote?: string;
  live?: { serviceId: number; categoryId: number } | null;
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
  const [cashCode, setCashCode] = useState<string | null>(null);
  const [cashMode, setCashMode] = useState(false);
  const [guideSelected, setGuideSelected] = useState(false);

  const party: Party = { adults, children, infants: 0 };
  const q = useMemo(() => quote(price, party, date || undefined), [price, adults, children, date]);

  const supportsChildren = price.kind === "adult_child_private";
  const guests = adults + children;
  const guideOn = Boolean(privateGuide && guideSelected);
  const seatsLeft = seatsLeftOnDeparture(groupMax, guests);
  const discounted = cashMode && q.kind === "priced" ? cashPrice(q.total) : null;

  function partySummary() {
    return (
      `— ${title}, ${adults} adult(s)` +
      (children ? `, ${children} child(ren)` : "") +
      (q.kind === "priced" ? `, indicative total ${formatPrice(lang, q.total)}` : ", price on request") +
      (cashMode
        ? discounted != null
          ? `, cash on arrival 10% off → ${formatPrice(lang, discounted)}`
          : ", cash on arrival 10% off"
        : "")
    );
  }

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
      payCash: cashMode,
      message:
        `${message}\n\n${partySummary()}` +
        (guideOn && privateGuide ? `\n${guideOpsNote(privateGuide.amount)}` : ""),
    });
    setSending(false);
    if (result.ok) {
      if (result.cashCode) setCashCode(result.cashCode);
      setSent(true);
    } else if (result.mailto) window.location.href = result.mailto;
  }

  async function openLive() {
    if (!live) return;
    const href = date
      ? bookUrl(live.serviceId, live.categoryId, date)
      : catalogUrl(live.serviceId, live.categoryId);
    if (guideOn && privateGuide) {
      setSending(true);
      try {
        await sendRequest({
          kind: "tour",
          lang,
          slug,
          name: "Travelotopos guest (private guide)",
          email: EMAIL,
          date,
          guests,
          message: `${guideOpsNote(privateGuide.amount)}\n\n${partySummary()}`,
        });
      } finally {
        setSending(false);
      }
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  if (sent) {
    return (
      <aside id="booking-panel" className="rounded-2xl bg-surface p-6 ring-1 ring-line">
        <div className="grid size-11 place-items-center rounded-full bg-olive-50 text-accent">
          <Check className="size-5" />
        </div>
        <p className="mt-4 font-display text-xl text-ink">{ui.requestSent}</p>
        {cashCode ? (
          <div className="mt-4 rounded-xl bg-olive-50 p-4 ring-1 ring-olive-200">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {ui.cashCodeLabel}
            </p>
            <p className="mt-1 font-display text-2xl tracking-[0.12em] text-ink">{cashCode}</p>
            <p className="mt-2 text-sm text-muted">{ui.cashCodeSent}</p>
          </div>
        ) : null}
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
              {discounted != null ? (
                <>
                  <span className="font-display text-lg text-faint line-through">
                    {formatPrice(lang, q.total)}
                  </span>
                  <span className="font-display text-3xl font-semibold text-ink">
                    {formatPrice(lang, discounted)}
                  </span>
                </>
              ) : (
                <span className="font-display text-3xl font-semibold text-ink">
                  {formatPrice(lang, q.total)}
                </span>
              )}
              <span className="text-sm text-faint">
                {guests} {guests === 1 ? ui.guestOne : ui.guestMany}
              </span>
            </div>
            {discounted != null ? (
              <p className="mt-1 text-xs font-semibold text-accent">{ui.cashOffPrice}</p>
            ) : null}
            {q.perPerson != null && guests > 1 ? (
              <p className="mt-1 text-sm text-muted">
                {formatPrice(lang, q.perPerson)} {ui.perPerson}
              </p>
            ) : null}
            {q.deposit != null ? (
              <p className="mt-1 text-xs text-muted">
                {fill(ui.depositHolds, { price: formatPrice(lang, q.deposit) })}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <span className="font-display text-2xl font-semibold text-ink">{ui.onRequest}</span>
            <p className="mt-1 text-sm text-muted">
              {q.reason === "out_of_range" ? ui.tellUsGroup : ui.checkAvail}
            </p>
            {cashMode ? <p className="mt-1 text-xs font-semibold text-accent">{ui.cashOnRequestNote}</p> : null}
          </>
        )}

        {/**
         * The tier nudge. On a sliding ladder a larger group is always cheaper
         * per head, so surfacing the next rate is genuinely useful rather than
         * a pressure tactic — the guest saves money by knowing.
         */}
        {q.kind === "priced" && q.nudge ? (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-olive-50 p-2.5 text-xs text-accent">
            <TrendingDown className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {fill(ui.nudgeAddGuest, {
                price: formatPrice(lang, q.nudge.newPerPerson),
                perPerson: ui.perPerson,
              })}
            </span>
          </p>
        ) : null}

        {priceNote ? <p className="mt-3 text-xs leading-relaxed text-faint">{priceNote}</p> : null}

        {seatsLeft ? (
          <p className="mt-3 text-xs font-semibold text-accent">{fill(ui.seatsLeft, { n: seatsLeft })}</p>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          if (live && !cashMode) {
            e.preventDefault();
            return;
          }
          void submit(e);
        }}
        className="grid gap-4 p-5"
      >
        {/* Party */}
        <div className="grid gap-3">
          <Stepper
            label={ui.adults}
            value={adults}
            min={Math.max(1, groupMin - children)}
            max={groupMax - children}
            onChange={setAdults}
          />
          {supportsChildren ? (
            <Stepper
              label={fill(ui.childrenAges, {
                min: price.childAges[0],
                max: price.childAges[1],
              })}
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
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9"
              required={!live || cashMode}
            />
          </span>
        </label>

        {privateGuide ? (
          <div
            className={cn(
              "rounded-xl p-4 ring-1 transition",
              guideSelected ? "bg-olive-50 ring-olive-200" : "bg-bg ring-line",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
              {ui.guideUpgradeEyebrow}
            </p>
            <p className="mt-1 font-display text-lg leading-snug text-ink">{ui.guideUpgradeTitle}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{ui.guideUpgradeBody}</p>
            {photoshoot === "with_guide" ? (
              <p className="mt-2 inline-flex items-start gap-1.5 text-sm font-semibold leading-relaxed text-accent">
                <Camera className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {ui.guidePhotoshootFree}
              </p>
            ) : null}
            <button
              type="button"
              aria-pressed={guideSelected}
              onClick={() => setGuideSelected((v) => !v)}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
                guideSelected
                  ? "bg-olive text-paper"
                  : "bg-surface text-accent ring-1 ring-olive-200 hover:bg-olive-50",
              )}
            >
              {guideSelected ? <Check className="size-3.5" /> : <Sparkles className="size-3.5" />}
              {guideSelected ? ui.guideAdded : ui.guideAdd}
            </button>
          </div>
        ) : null}

        {/* Line items, so the total is never a black box. */}
        {q.kind === "priced" && !guideOn ? (
          <dl className="grid gap-1.5 rounded-lg bg-bg p-3 text-sm">
            {q.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-3 text-muted">
                <dt>
                  {quoteLineLabel(ui, line.label)}
                  {line.qty > 1 ? ` × ${line.qty}` : ""}
                </dt>
                <dd>{formatPrice(lang, line.total)}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2 font-semibold text-ink">
              <dt>{ui.total}</dt>
              <dd>{formatPrice(lang, q.total)}</dd>
            </div>
          </dl>
        ) : null}

        {guideOn && privateGuide ? (
          <dl className="grid gap-1.5 rounded-lg bg-bg p-3 text-sm">
            {q.kind === "priced" ? (
              <div className="flex justify-between gap-3 text-muted">
                <dt>{ui.tourLine}</dt>
                <dd>{formatPrice(lang, q.total)}</dd>
              </div>
            ) : null}
            <div>
              <div className="flex justify-between gap-3 text-muted">
                <dt>{ui.guideLine}</dt>
                <dd>+{formatPrice(lang, privateGuide.amount)}</dd>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-faint">{ui.guidePayNote}</p>
            </div>
            {q.kind === "priced" ? (
              <>
                <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2 font-semibold text-ink">
                  <dt>{ui.payOnline}</dt>
                  <dd>{formatPrice(lang, q.total)}</dd>
                </div>
                <div className="flex justify-between gap-3 text-sm text-muted">
                  <dt>{ui.dayTotal}</dt>
                  <dd>{formatPrice(lang, q.total + privateGuide.amount)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        ) : null}

        {thirdPartyCosts.length > 0 ? (
          <details className="rounded-lg bg-bg p-3 text-sm">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              {ui.payableOnDay}
            </summary>
            <ul className="mt-2 grid gap-1 text-xs text-muted">
              {thirdPartyCosts.map((cost) => (
                <li key={cost.label} className="flex justify-between gap-3">
                  <span>
                    {costLabel(lang, cost.label)}
                    {cost.optional ? ` ${ui.optionalParen}` : ""}
                  </span>
                  <span>
                    {cost.amount != null
                      ? `${formatPrice(lang, cost.amount)}${cost.perPerson ? ` ${ui.perPersonShort}` : ""}`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {live ? (
          <>
            <Button type="button" size="lg" className="w-full" disabled={sending} onClick={() => void openLive()}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
              {date ? ui.bookLive : ui.bookLiveOpen}
            </Button>
            <p className="text-center text-xs text-muted">{ui.livePayNote}</p>
            <button
              type="button"
              onClick={() => setCashMode((v) => !v)}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
                cashMode
                  ? "bg-olive text-paper"
                  : "bg-surface text-accent ring-1 ring-olive-200 hover:bg-olive-50",
              )}
            >
              <Banknote className="size-3.5" />
              {ui.payCashCta}
            </button>
            {cashMode ? (
              <>
                <p className="text-xs leading-relaxed text-muted">{ui.payCashNote}</p>
                <ContactFields
                  ui={ui}
                  name={name}
                  email={email}
                  hotel={hotel}
                  message={message}
                  onName={setName}
                  onEmail={setEmail}
                  onHotel={setHotel}
                  onMessage={setMessage}
                />
                <Button type="submit" size="lg" disabled={sending} className="w-full">
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}
                  {sending ? ui.sending : ui.requestCashCode}
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg p-3 text-sm ring-1 ring-line">
              <input
                type="checkbox"
                checked={cashMode}
                onChange={(e) => setCashMode(e.target.checked)}
                className="mt-0.5 size-4 accent-olive"
              />
              <span>
                <span className="font-semibold text-ink">{ui.payCashToggle}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{ui.payCashNote}</span>
              </span>
            </label>
            <ContactFields
              ui={ui}
              name={name}
              email={email}
              hotel={hotel}
              message={message}
              onName={setName}
              onEmail={setEmail}
              onHotel={setHotel}
              onMessage={setMessage}
            />

            <Button type="submit" size="lg" disabled={sending} className="w-full">
              {sending ? <Loader2 className="size-4 animate-spin" /> : cashMode ? <Banknote className="size-4" /> : null}
              {sending ? ui.sending : cashMode ? ui.requestCashCode : ui.bookThis}
            </Button>
          </>
        )}

        {cancelFreeHours > 0 ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5 text-accent" />
            {ui.freeCancel} · {cancelFreeHours}h
          </p>
        ) : null}
      </form>
    </aside>
  );
}

function ContactFields({
  ui,
  name,
  email,
  hotel,
  message,
  onName,
  onEmail,
  onHotel,
  onMessage,
}: {
  ui: UI;
  name: string;
  email: string;
  hotel: string;
  message: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onHotel: (v: string) => void;
  onMessage: (v: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <Input placeholder={ui.name} value={name} onChange={(e) => onName(e.target.value)} required />
      <Input
        type="email"
        placeholder={ui.email}
        value={email}
        onChange={(e) => onEmail(e.target.value)}
        required
      />
      <Input placeholder={ui.hotel} value={hotel} onChange={(e) => onHotel(e.target.value)} />
      <Textarea placeholder={ui.message} value={message} onChange={(e) => onMessage(e.target.value)} />
    </div>
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
        <span className="w-7 text-center text-sm font-semibold tabular-nums text-ink">{value}</span>
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
          : "text-accent ring-olive-200 hover:bg-olive-50",
      )}
    >
      {children}
    </button>
  );
}
