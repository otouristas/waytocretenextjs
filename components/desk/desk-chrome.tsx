"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import { GuestChat } from "@/components/desk/guest-chat";
import { WhatsAppFab } from "@/components/desk/whatsapp-fab";
import { DESK_DOCK, DESK_OPEN_CHAT } from "@/lib/desk/bus";
import { cn } from "@/lib/cn";

export function DeskChrome({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  // Set while a page-level dock (currently the tour booking dock) owns the
  // bottom of the screen and carries these same two actions itself.
  const [dockActive, setDockActive] = useState(false);
  const pathOnScreen = useRef(pathname);

  useEffect(() => {
    const open = () => setChatOpen(true);
    const dock = (event: Event) => setDockActive(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener(DESK_OPEN_CHAT, open);
    window.addEventListener(DESK_DOCK, dock);
    return () => {
      window.removeEventListener(DESK_OPEN_CHAT, open);
      window.removeEventListener(DESK_DOCK, dock);
    };
  }, []);

  // The chrome lives in the locale layout, so the sheet would otherwise stay
  // open across in-app navigations — including a tour card the guest just
  // tapped. Fold it away as soon as the path changes; the thread stays.
  useEffect(() => {
    if (pathOnScreen.current === pathname) return;
    pathOnScreen.current = pathname;
    setChatOpen(false);
  }, [pathname]);

  /*
   * A dock stands the orbs down only below `lg` — that is the only width the
   * dock renders at, so above it there is nothing to defer to.
   *
   * The two corners do not behave alike. The left one is just the WhatsApp
   * orb and hides whenever the chat is open. The right one *contains* the
   * open chat sheet, not only its trigger, so it can never be hidden or made
   * inert while the chat is open — and the chat outranks the dock there,
   * because the dock's own AI button is one way it got opened.
   */
  const HIDDEN = "pointer-events-none scale-90 opacity-0";
  const BELOW_LG = `${HIDDEN} lg:pointer-events-auto lg:scale-100 lg:opacity-100`;

  const waOrb = chatOpen ? HIDDEN : dockActive ? BELOW_LG : "pointer-events-auto";
  const chatOrb = dockActive && !chatOpen ? BELOW_LG : "pointer-events-auto";

  return (
    <div className={cn("pointer-events-none fixed inset-0", chatOpen ? "z-[80]" : "z-50")}>
      {chatOpen ? (
        <button
          type="button"
          aria-label={t(lang).chatClose}
          className="pointer-events-auto absolute inset-0 bg-earth/25 backdrop-blur-[2px]"
          onClick={() => setChatOpen(false)}
        />
      ) : null}

      <div className="pointer-events-none absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] left-3">
        <div className={cn("transition", waOrb)}>
          <WhatsAppFab lang={lang} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] right-3">
        <div className={cn("relative transition", chatOrb)}>
          <GuestChat lang={lang} open={chatOpen} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)} />
        </div>
      </div>
    </div>
  );
}
