import { fill, LANG_META, type Lang } from "../i18n/langs.ts";
import { BRAND } from "../site.ts";

export type ReviewPromptInput = {
  lang: Lang;
  name: string;
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  experience: string;
  hotel?: string;
  host?: string;
  highlight: string;
};

type PromptCopy = {
  opening: string;
  pickup: string;
  host: string;
  recommend: string;
};

const PROMPT: Record<Lang, PromptCopy> = {
  en: {
    opening: "We did {experience} with {brand} on {date}.",
    pickup: "Pickup was from {hotel}.",
    host: "{host} was our host.",
    recommend: "I'd recommend {brand} if you're staying in Crete.",
  },
  de: {
    opening: "Wir waren am {date} mit {brand} auf {experience}.",
    pickup: "Abholung war vom {hotel}.",
    host: "{host} war unser Gastgeber.",
    recommend: "Ich kann {brand} jedem empfehlen, der auf Kreta ist.",
  },
  it: {
    opening: "Abbiamo fatto {experience} con {brand} il {date}.",
    pickup: "Ci hanno presi al {hotel}.",
    host: "{host} è stato il nostro host.",
    recommend: "Consiglio {brand} se siete a Creta.",
  },
  fr: {
    opening: "Nous avons fait {experience} avec {brand} le {date}.",
    pickup: "Prise en charge à {hotel}.",
    host: "{host} était notre hôte.",
    recommend: "Je recommande {brand} si vous êtes en Crète.",
  },
  sv: {
    opening: "Vi gjorde {experience} med {brand} den {date}.",
    pickup: "Hämtning från {hotel}.",
    host: "{host} var vår värd.",
    recommend: "Jag rekommenderar {brand} om ni är på Kreta.",
  },
};

/**
 * A first-person review ready to paste on Google or Tripadvisor.
 *
 * The guest's own words are the middle paragraph. Facts from the form
 * open and close it. No star rating — the platform collects that.
 */
export function reviewPrompt(input: ReviewPromptInput): string {
  const copy = PROMPT[input.lang];
  const hotel = input.hotel?.trim();
  const host = input.host?.trim();
  const vars = {
    brand: BRAND,
    experience: input.experience.trim(),
    date: formatReviewDate(input.date, input.lang),
    hotel: hotel ?? "",
    host: host ?? "",
  };

  const lead = [fill(copy.opening, vars)];
  if (hotel) lead.push(fill(copy.pickup, vars));
  if (host) lead.push(fill(copy.host, vars));

  return [lead.join(" "), asSentence(input.highlight), fill(copy.recommend, vars)].join("\n\n");
}

export function formatReviewDate(iso: string, lang: Lang): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(LANG_META[lang].dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function asSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const first = trimmed.charAt(0);
  const rest = trimmed.slice(1);
  const capped = first.toLocaleUpperCase() + rest;
  return /[.!?…]$/u.test(capped) ? capped : `${capped}.`;
}
