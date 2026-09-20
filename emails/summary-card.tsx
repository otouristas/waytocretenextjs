import { CardShell, Quote, StatRow } from "@/emails/chrome";
import type { Hero } from "@/lib/email/content";

/**
 * The hero for every request that is not a built custom day: the tour, the
 * transfer, the photography session, the trade enquiry, the plain message.
 *
 * Those five used to arrive as a heading and a bare label/value table while a
 * custom day arrived with a card — the whole reason some of these mails
 * looked designed and the rest looked like a form dump. Same shell, same
 * bands, same type as `CustomDayCard`; only the facts differ.
 */
export function SummaryCard({ hero, noteLabel }: { hero: Hero; noteLabel: string }) {
  return (
    <CardShell heading={hero.heading} headline={hero.headline}>
      <StatRow stats={hero.stats} />
      {hero.note ? <Quote label={noteLabel}>{hero.note}</Quote> : null}
    </CardShell>
  );
}
