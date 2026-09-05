"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowRight, ArrowUp, RotateCcw, Square, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { WHATSAPP } from "@/lib/site";
import { cn } from "@/lib/cn";
import { DESK_DATA_PART, type DeskAnswer, type DeskRouteCard, type DeskTourCard } from "@/lib/desk/cards";
import { RouteCards, TourCards } from "@/components/desk/desk-cards";
import { WhatsAppGlyph } from "@/components/desk/whatsapp-fab";

/** Olive's face. The orb, the header and every reply share the one mark. */
export function OliveMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
      <path d="M11 19c2.2-4.8 7.8-4.8 10 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12.2" cy="13.2" r="1.15" fill="currentColor" />
      <circle cx="19.8" cy="13.2" r="1.15" fill="currentColor" />
      <path d="M16 7.2c.4 2.2-.2 3.8-1.6 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function textOf(message: UIMessage) {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function ToolBits({ part, lang }: { part: UIMessage["parts"][number]; lang: Lang }) {
  if (!("type" in part) || typeof part.type !== "string" || !part.type.startsWith("tool-")) return null;
  const state = "state" in part ? String(part.state) : "";
  // The animated dots below already say the desk is working; a second
  // "Checking the diary…" line under them was just noise.
  if (state !== "output-available" || !("output" in part)) return null;
  const output = part.output as Record<string, unknown>;

  if (part.type === "tool-searchExperiences") {
    const matches = (output.matches as DeskTourCard[] | undefined) ?? [];
    return <TourCards cards={matches.slice(0, 3)} lang={lang} />;
  }

  if (part.type === "tool-getExperience") {
    const card = output.card as DeskTourCard | null | undefined;
    return card ? <TourCards cards={[card]} lang={lang} /> : null;
  }

  if (part.type === "tool-transferRules") {
    const routes = (output.routes as DeskRouteCard[] | undefined) ?? [];
    return <RouteCards cards={routes} lang={lang} />;
  }

  if (part.type === "tool-whatsappDesk") {
    return <LinkOut href={String(output.url || WHATSAPP)}>{t(lang).whatsapp}</LinkOut>;
  }

  if (part.type === "tool-checkAvailability") {
    const href = String(output.bookUrl || output.catalogUrl || "");
    return href ? <LinkOut href={href}>{t(lang).bookLiveOpen}</LinkOut> : null;
  }

  return null;
}

/**
 * The local desk answer.
 *
 * Arrives as a `data-desk` part from the catalog brain — tours, routes,
 * prices and CTAs, never a model.
 */
function DeskBits({
  part,
  lang,
  onAsk,
}: {
  part: UIMessage["parts"][number];
  lang: Lang;
  onAsk: (text: string) => void;
}) {
  if (!("type" in part) || part.type !== `data-${DESK_DATA_PART}`) return null;
  const answer = (part as { data: DeskAnswer }).data;
  if (!answer) return null;
  return (
    <>
      <TourCards cards={answer.tours} lang={lang} />
      <RouteCards cards={answer.routes} lang={lang} />
      {answer.followUps.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {answer.followUps.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onAsk(chip)}
              className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink ring-1 ring-line transition hover:bg-olive-50 hover:ring-olive"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

/** Fold the sheet before an in-app link navigates, so the new page is not
 *  hidden behind a dialog the guest already left. New tabs and tel/mailto
 *  stay put. */
function minimizeIfInAppNav(event: MouseEvent, onClose: () => void) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const node = event.target;
  if (!(node instanceof Element)) return;
  const anchor = node.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
  let next: URL;
  try {
    next = new URL(anchor.href);
  } catch {
    return;
  }
  if (next.origin !== window.location.origin) return;
  if (next.pathname === window.location.pathname && next.search === window.location.search) return;
  onClose();
}

function LinkOut({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-olive px-4 text-xs font-semibold text-paper transition hover:bg-olive-deep"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </a>
  );
}

export function GuestChat({
  lang,
  open,
  onOpen,
  onClose,
}: {
  lang: Lang;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const copy = t(lang);
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ lang, path: typeof window === "undefined" ? pathname : window.location.pathname }),
      }),
    [lang, pathname],
  );
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);

  // The field grows with what is typed rather than scrolling inside two lines.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 132)}px`;
  }, [input]);

  // A full-screen sheet on a phone must not leave the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={onOpen}
          className="pointer-events-auto absolute -top-9 right-0 hidden max-w-40 truncate rounded-full bg-earth px-3 py-1 text-[11px] text-paper shadow-lg sm:block"
        >
          {copy.chatKicker}
        </button>
      ) : null}

      <button
        type="button"
        onClick={open ? onClose : onOpen}
        aria-label={open ? copy.chatClose : copy.chatOpen}
        aria-expanded={open}
        className={cn(
          "glass-orb relative grid size-[52px] place-items-center rounded-full text-paper transition hover:scale-[1.03] active:scale-95",
          open && "ring-2 ring-paper/70",
          // On a phone the sheet is full-screen and covers this entirely. Its
          // own header X closes it there.
          open && "max-sm:hidden",
        )}
      >
        {open ? <X className="size-5" /> : <OliveMark />}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.chatName}
          onClickCapture={(event) => minimizeIfInAppNav(event, onClose)}
          className={cn(
            "chat-sheet pointer-events-auto z-[80] flex flex-col overflow-hidden",
            // Phone: the whole screen. It is the only thing you are doing.
            "fixed inset-0 h-[100dvh] w-screen",
            // Desktop: a proper panel — a quarter wider than the old 24rem
            // card and half again as tall, so a reply and the tour card under
            // it are on screen together instead of one at a time.
            "sm:absolute sm:inset-auto sm:bottom-[4.35rem] sm:right-0 sm:h-[min(44rem,calc(100dvh-6.5rem))] sm:w-[27rem] sm:rounded-[28px] lg:w-[30rem]",
          )}
        >
          {/*
            The original header, kept as it was: the script kicker in paper,
            the olive bloom behind it, the desk's name in caps, and the line
            about what Olive can actually do. It reads like the brand rather
            than like a widget, and that is the whole point of it.

            Scaled up a step for the wider panel, and the row now holds an
            avatar so the face in the corner is the same face that answers.
          */}
          <header className="relative shrink-0 overflow-hidden bg-earth px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-paper sm:px-5 sm:pt-5">
            <div className="absolute -right-6 -top-8 size-32 rounded-full bg-olive/30 blur-2xl" />
            <div className="absolute -left-10 top-6 size-24 rounded-full bg-paper/10 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-olive/90 text-paper ring-1 ring-paper/15">
                  <OliveMark className="size-7" />
                </span>
                <div className="min-w-0">
                  <p className="font-script text-[1.75rem] leading-none text-paper">
                    {copy.chatKicker}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/80">
                    <span className="size-1.5 rounded-full bg-olive-200" />
                    {copy.chatName} · Rethymno
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full bg-paper/10 text-paper ring-1 ring-paper/15 transition hover:bg-paper/20 sm:size-9"
                  aria-label={copy.chatNew}
                  title={copy.chatNew}
                  onClick={() => setMessages([])}
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full bg-paper/20 text-paper ring-1 ring-paper/30 transition hover:bg-paper/30 sm:size-9"
                  onClick={onClose}
                  aria-label={copy.chatClose}
                >
                  <X className="size-5" strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <p className="relative mt-3.5 text-xs leading-relaxed text-paper/75">{copy.chatHint}</p>
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
            {messages.length === 0 ? (
              <div className="chat-msg">
                <p className="font-display text-[1.35rem] leading-snug text-ink">{copy.chatGreeting}</p>

                {/* Full-width rows, not pills. These are the first thing a
                    guest touches, and a 28px pill on a phone is a smaller
                    target than it is a suggestion. */}
                <ul className="mt-4 space-y-1.5">
                  {copy.chatChips.map((chip) => (
                    <li key={chip}>
                      <button
                        type="button"
                        onClick={() => void send(chip)}
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left text-sm font-medium text-ink ring-1 ring-line transition hover:bg-olive-50 hover:ring-olive"
                      >
                        {chip}
                        <ArrowRight className="size-4 shrink-0 text-line transition group-hover:translate-x-0.5 group-hover:text-accent" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="chat-msg flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-earth px-4 py-2.5 text-sm leading-relaxed text-paper">
                    {textOf(message)}
                  </p>
                </div>
              ) : (
                /* No bubble and no ring on the reply. It was a bordered box
                   whose only content was more bordered boxes — the cards
                   already carry their own edge, so wrapping them put three
                   frames around one tour. */
                <div key={message.id} className="chat-msg flex gap-2.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-olive text-paper">
                    <OliveMark className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {textOf(message) ? (
                      <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink">
                        {textOf(message)}
                      </p>
                    ) : null}
                    {message.parts.map((part, index) => (
                      <div key={`${message.id}-${index}`}>
                        <ToolBits part={part} lang={lang} />
                        <DeskBits part={part} lang={lang} onAsk={(text) => void send(text)} />
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}

            {busy ? (
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-olive text-paper">
                  <OliveMark className="size-5" />
                </span>
                <span className="flex items-center gap-1" role="status" aria-label={copy.chatTyping}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="chat-dot size-1.5 rounded-full bg-olive"
                      style={{ animationDelay: `${i * 0.16}s` }}
                    />
                  ))}
                </span>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-2xl bg-clay-soft/25 px-4 py-3 text-xs text-ink ring-1 ring-clay/30">
                {copy.chatError}
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form
            className="shrink-0 border-t border-line bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <div className="flex items-end gap-1 rounded-[22px] bg-bg p-1.5 pl-3.5 ring-1 ring-line transition focus-within:ring-olive">
              <textarea
                ref={fieldRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={copy.chatPlaceholder}
                className="max-h-[8.25rem] min-h-10 flex-1 resize-none self-center bg-transparent py-2 text-base leading-relaxed outline-none placeholder:text-faint"
              />
              {/* WhatsApp sits beside the send key rather than as a line of
                  uppercase text under the composer: it is an alternative to
                  sending, so it belongs where sending happens. */}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={copy.whatsapp}
                title={copy.whatsapp}
                className="grid size-10 shrink-0 place-items-center rounded-full text-[#25D366] transition hover:bg-surface"
              >
                <WhatsAppGlyph className="size-5" />
              </a>
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-earth text-paper"
                  aria-label={copy.chatStop}
                >
                  <Square className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-olive text-paper transition hover:bg-olive-deep disabled:opacity-35"
                  aria-label={copy.send}
                >
                  <ArrowUp className="size-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
