"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { fill, langPath, type Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { sendRequest } from "@/lib/send-request";
import {
  ADDRESS_DISPLAY,
  EMAIL,
  PHONE,
  PHONE_DISPLAY,
  PHONE_OFFICE,
  PHONE_OFFICE_DISPLAY,
  WHATSAPP,
} from "@/lib/site";
import { ContactMap } from "@/components/contact-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Contact.
 *
 * The previous page put four unstyled inputs beside a paragraph and buried
 * WhatsApp — the channel the operator actually answers fastest — inside a
 * row of plain links alongside Instagram and Tripadvisor, which are not
 * contact channels at all. Here the three real channels are the first thing
 * on the page, each stating what it is for, and the form is the fallback for
 * a guest who would rather write it all down.
 *
 * The `q`, `date` and `guests` search params are carried in from the hero
 * search, so a visitor who typed "gorge hike" and hit enter does not have to
 * say it twice.
 */
export function ContactView({
  lang,
  initialDate = "",
  initialGuests = "",
  initialQ = "",
}: {
  lang: Lang;
  initialDate?: string;
  initialGuests?: string;
  initialQ?: string;
}) {
  const copy = t(lang);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hotel, setHotel] = useState("");
  const [date, setDate] = useState(initialDate);
  const [guests, setGuests] = useState(initialGuests || "2");
  const [message, setMessage] = useState(initialQ ? fill(copy.lookingAt, { q: initialQ }) : "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {copy.getInTouch}
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{copy.contactTitle}</h1>
        <p className="mt-4 leading-relaxed text-muted">{copy.contactLead}</p>
      </header>

      {/* The three channels, in the order they get answered. */}
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        <Channel
          href={WHATSAPP}
          external
          icon={<MessageCircle className="size-5" />}
          title={copy.whatsapp}
          value={PHONE_DISPLAY}
          note={copy.whatsappNote}
          accent
        />
        <Channel
          href={`tel:${PHONE}`}
          icon={<Phone className="size-5" />}
          title={copy.phone}
          value={PHONE_DISPLAY}
          note={fill(copy.officeLine, { n: PHONE_OFFICE_DISPLAY })}
          secondaryHref={`tel:${PHONE_OFFICE}`}
        />
        <Channel
          href={`mailto:${EMAIL}`}
          icon={<Mail className="size-5" />}
          title={copy.email}
          value={EMAIL}
          note={copy.emailNote}
        />
      </ul>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
        <div>
          <h2 className="font-display text-2xl text-ink">{copy.faq}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {copy.faqs.slice(0, 4).map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink marker:content-['']">
                  {faq.q}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-olive-50 text-accent transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            <Aside icon={<MapPin className="size-4" />} title={copy.meetingPoint}>
              {ADDRESS_DISPLAY}. {copy.pickupAreaNote}
            </Aside>
            <Aside icon={<Clock className="size-4" />} title={copy.replyTimeTitle}>
              {copy.replyTimeBody}
            </Aside>
          </ul>

          <ContactMap lang={lang} />

          <p className="mt-8 text-sm text-muted">
            {copy.lookingForTransfer}{" "}
            <Link href={langPath(lang, "/transfers")} className="font-semibold text-accent underline">
              {copy.navTransfers}
            </Link>{" "}
            ·{" "}
            <Link
              href={langPath(lang, "/transfers/weddings")}
              className="font-semibold text-accent underline"
            >
              {copy.weddingTransfers}
            </Link>
          </p>
        </div>

        {done ? (
          <div className="flex items-start gap-4 rounded-2xl bg-olive-50 p-6 ring-1 ring-olive-200">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive text-paper">
              <Check className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-accent">{copy.submitted}</p>
          </div>
        ) : (
          <form
            id="booking-panel"
            className="grid scroll-mt-28 gap-3 rounded-2xl bg-surface p-6 ring-1 ring-line md:p-7 lg:sticky lg:top-28"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              const result = await sendRequest({
                kind: "contact",
                lang,
                name,
                email,
                hotel,
                date,
                guests: guests ? Number(guests) : undefined,
                message,
              });
              setBusy(false);
              if (!result.ok) window.location.href = result.mailto;
              setDone(true);
            }}
          >
            <h2 className="font-display text-2xl text-ink">{copy.requestDay}</h2>

            <Field label={copy.name}>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field label={copy.email}>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={copy.selectDate}>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label={copy.guests}>
                <Input
                  type="number"
                  min={1}
                  max={19}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </Field>
            </div>

            <Field label={copy.hotel}>
              <Input value={hotel} onChange={(e) => setHotel(e.target.value)} />
            </Field>
            <Field label={copy.message}>
              <Textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>

            <Button type="submit" className="h-12" disabled={busy}>
              {busy ? copy.sending : copy.send}
            </Button>
            <p className="text-xs text-faint">{copy.chatHint}</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Channel({
  href,
  external = false,
  icon,
  title,
  value,
  note,
  secondaryHref,
  accent = false,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
  secondaryHref?: string;
  accent?: boolean;
}) {
  const cardClass = [
    "flex h-full flex-col gap-3 rounded-2xl p-6 ring-1 transition",
    accent
      ? "bg-olive text-paper ring-olive hover:bg-olive-deep"
      : "bg-surface text-ink ring-line hover:ring-olive-200",
  ].join(" ");
  const linkProps = external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
  const noteClass = ["mt-auto text-xs leading-relaxed", accent ? "text-paper/80" : "text-faint"].join(
    " ",
  );
  const head = (
    <>
      <span
        className={[
          "grid size-10 place-items-center rounded-full",
          accent ? "bg-paper/15 text-paper" : "bg-olive-50 text-accent",
        ].join(" ")}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-lg">{title}</span>
        <span className={accent ? "text-sm text-paper/90" : "text-sm text-muted"}>{value}</span>
      </span>
    </>
  );

  // A second tel: link cannot live inside the card <a> — nested anchors
  // hydrate as invalid HTML. The office landline stays on the same card
  // as a sibling link: same channel, same people, just a desk number.
  if (secondaryHref) {
    return (
      <li>
        <div className={cardClass}>
          <a href={href} {...linkProps} className="flex flex-col gap-3">
            {head}
          </a>
          <a href={secondaryHref} className={`${noteClass} underline decoration-line hover:text-accent`}>
            {note}
          </a>
        </div>
      </li>
    );
  }

  return (
    <li>
      <a href={href} {...linkProps} className={cardClass}>
        {head}
        <span className={noteClass}>{note}</span>
      </a>
    </li>
  );
}

function Aside({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-xl bg-surface p-4 ring-1 ring-line">
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span className="text-accent">{icon}</span>
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{children}</p>
    </li>
  );
}
