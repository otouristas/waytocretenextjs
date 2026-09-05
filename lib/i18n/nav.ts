import type { Lang } from "./langs";
import { langPath } from "./langs";
import { t } from "./ui";
import { hubCopy } from "./hubs";
import { HUBS, type HubId } from "@/lib/nav/hubs";

/**
 * Primary navbar — source of truth.
 *
 * Labels and parent/child shape match the live Way to Crete menu. Hrefs are
 * the Next.js routes that actually resolve (locale-prefixed). WordPress
 * permalinks 301 here via `lib/content/redirects.ts`.
 */

export type NavBadge = "most_booked" | "private" | "seasonal" | "couples" | "multiday";

export type NavKind = "link" | "mega" | "menu";

export type NavTourSpec = {
  slug: string;
  label: string;
};

export type NavColumnSpec = {
  hub: HubId;
  tours: readonly NavTourSpec[];
};

export type NavItemSpec = {
  id: string;
  kind: NavKind;
  /** Path without locale, or null for a dropdown-only parent. */
  path: string | null;
  columns?: readonly NavColumnSpec[];
  tours?: readonly NavTourSpec[];
};

export const TOUR_COLUMNS: readonly NavColumnSpec[] = [
  {
    hub: "outdoor-activities-nature-tours-crete",
    tours: [
      { slug: "lake-kournas-argyroupoli-springs-tour", label: "Lake Kournas & Argyroupoli Springs Tour" },
      { slug: "cretan-nature-village-journey", label: "Cretan Nature & Village Journey" },
      { slug: "south-crete-highlights", label: "South Crete Highlights" },
      { slug: "elafonisi-pink-sand-beach-tour-from-rethymno", label: "Elafonisi Pink Sand Beach Tour from Rethymno" },
    ],
  },
  {
    hub: "cretan-history-tours",
    tours: [
      { slug: "timeless-crete-villages-monasteries", label: "Timeless Crete: Villages & Monasteries" },
      { slug: "spinalonga-tour-from-rethymno", label: "Spinalonga tour from Rethymno" },
    ],
  },
  {
    hub: "cretan-culture-tours",
    tours: [
      { slug: "shepherd-for-a-day-crete", label: "Shepherd for a Day Crete" },
      { slug: "knossos-palace-private-tour", label: "Knossos Palace Private Tour" },
    ],
  },
  {
    hub: "cretan-gastronomy-food-tours",
    tours: [
      { slug: "authentic-cretan-cooking-class", label: "Authentic Cretan Cooking Class" },
      { slug: "rethymno-walk-taste", label: "Rethymno Walk & Taste" },
      { slug: "cretan-honey-wine-experience", label: "Cretan Honey & Wine Experience" },
    ],
  },
  {
    hub: "hiking-trekking-from-rethymno",
    tours: [
      { slug: "imbros-gorge-guided-tour", label: "Imbros Gorge Guided Tour" },
      { slug: "samaria-gorge-explorer", label: "Samaria Gorge Explorer" },
      { slug: "aradaina-gorge", label: "Aradaina Gorge" },
      { slug: "pachnes-summit", label: "Private hike to Pachnes summit" },
    ],
  },
  {
    hub: "signature-experiences",
    tours: [
      { slug: "taste-of-crete", label: "Taste Of Crete" },
      { slug: "romance-history-in-rethymno", label: "Romance & History" },
      { slug: "botanical-tours-crete", label: "Wildflowers Crete Tour" },
      { slug: "sunset-sound-therapy", label: "Sunset Sound Therapy" },
    ],
  },
];

export const NAV_SPEC: readonly NavItemSpec[] = [
  { id: "home", kind: "link", path: "/" },
  { id: "about", kind: "link", path: "/about" },
  { id: "tours", kind: "mega", path: "/tours", columns: TOUR_COLUMNS },
  { id: "create", kind: "link", path: "/create" },
  {
    id: "multiday",
    kind: "menu",
    path: "/multiday-tours",
    tours: [
      {
        slug: "spring-wildflowers-orchids-of-crete",
        label: "Spring Wildflowers & Orchids of Crete",
      },
    ],
  },
  {
    id: "transfer",
    kind: "menu",
    path: "/transfers",
    tours: [{ slug: "wedding-transfers", label: "Wedding Transfers" }],
  },
  { id: "boat", kind: "link", path: "/tours/boat-cruise" },
  { id: "blog", kind: "link", path: "/guides" },
  { id: "contact", kind: "link", path: "/contact" },
];

export type NavCopy = {
  home: string;
  about: string;
  tours: string;
  create: string;
  multiday: string;
  transfer: string;
  boat: string;
  blog: string;
  contact: string;
  bookNow: string;
  seeAllTours: string;
  seeCollection: string;
  featured: string;
  mostBooked: string;
  private: string;
  seasonal: string;
  couples: string;
  multidayBadge: string;
  experiences: string;
  openMenu: string;
  allTransfers: string;
  licensed: string;
};

const NAV_COPY: Record<Lang, NavCopy> = {
  en: {
    home: "Home",
    about: "About us",
    tours: "Crete Tours",
    create: "Create your day",
    multiday: "Multiday Tours",
    transfer: "Transfer",
    boat: "Boat Cruise",
    blog: "Blog",
    contact: "Contact",
    bookNow: "Book now",
    seeAllTours: "See all Crete tours",
    seeCollection: "View collection",
    featured: "Featured this season",
    mostBooked: "Most booked",
    private: "Private",
    seasonal: "Spring only",
    couples: "Couples",
    multidayBadge: "7 days",
    experiences: "experiences",
    openMenu: "Open menu",
    allTransfers: "Airport & hotel transfers",
    licensed: "Licensed Greek operator",
  },
  de: {
    home: "Startseite",
    about: "Über uns",
    tours: "Kreta Touren",
    create: "Tag gestalten",
    multiday: "Mehrtagesreisen",
    transfer: "Transfer",
    boat: "Bootsfahrt",
    blog: "Blog",
    contact: "Kontakt",
    bookNow: "Jetzt buchen",
    seeAllTours: "Alle Kreta-Touren",
    seeCollection: "Kollektion ansehen",
    featured: "In dieser Saison",
    mostBooked: "Am häufigsten gebucht",
    private: "Privat",
    seasonal: "Nur im Frühling",
    couples: "Paare",
    multidayBadge: "7 Tage",
    experiences: "Erlebnisse",
    openMenu: "Menü öffnen",
    allTransfers: "Flughafen- & Hoteltransfers",
    licensed: "Lizenzierter griechischer Veranstalter",
  },
  it: {
    home: "Home",
    about: "Chi siamo",
    tours: "Tour a Creta",
    create: "Crea la tua giornata",
    multiday: "Tour di più giorni",
    transfer: "Transfer",
    boat: "Crociera in barca",
    blog: "Blog",
    contact: "Contatti",
    bookNow: "Prenota ora",
    seeAllTours: "Tutti i tour di Creta",
    seeCollection: "Vedi la collezione",
    featured: "In evidenza",
    mostBooked: "I più prenotati",
    private: "Privato",
    seasonal: "Solo in primavera",
    couples: "Coppie",
    multidayBadge: "7 giorni",
    experiences: "esperienze",
    openMenu: "Apri il menu",
    allTransfers: "Transfer aeroporto e hotel",
    licensed: "Tour operator greco autorizzato",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    tours: "Circuits en Crète",
    create: "Créer votre journée",
    multiday: "Circuits de plusieurs jours",
    transfer: "Transfert",
    boat: "Croisière",
    blog: "Blog",
    contact: "Contact",
    bookNow: "Réserver",
    seeAllTours: "Tous les circuits de Crète",
    seeCollection: "Voir la collection",
    featured: "À la une",
    mostBooked: "Les plus réservés",
    private: "Privé",
    seasonal: "Printemps seulement",
    couples: "Couples",
    multidayBadge: "7 jours",
    experiences: "expériences",
    openMenu: "Ouvrir le menu",
    allTransfers: "Transferts aéroport et hôtel",
    licensed: "Voyagiste grec agréé",
  },
  sv: {
    home: "Hem",
    about: "Om oss",
    tours: "Kretaturer",
    create: "Skapa er dag",
    multiday: "Flerdagarsturer",
    transfer: "Transfer",
    boat: "Båttur",
    blog: "Blogg",
    contact: "Kontakt",
    bookNow: "Boka nu",
    seeAllTours: "Alla Kretaturer",
    seeCollection: "Visa samlingen",
    featured: "Utvalt just nu",
    mostBooked: "Mest bokade",
    private: "Privat",
    seasonal: "Endast vår",
    couples: "Par",
    multidayBadge: "7 dagar",
    experiences: "upplevelser",
    openMenu: "Öppna menyn",
    allTransfers: "Flygplats- och hoteltransfer",
    licensed: "Licensierad grekisk arrangör",
  },
};

export function navCopy(lang: Lang): NavCopy {
  return NAV_COPY[lang] ?? NAV_COPY.en;
}

export function itemLabel(id: string, lang: Lang): string {
  const copy = navCopy(lang);
  switch (id) {
    case "home":
      return copy.home;
    case "about":
      return copy.about;
    case "tours":
      return copy.tours;
    case "create":
      return copy.create;
    case "multiday":
      return copy.multiday;
    case "transfer":
      return copy.transfer;
    case "boat":
      return copy.boat;
    case "blog":
      return copy.blog;
    case "contact":
      return copy.contact;
    default:
      return id;
  }
}

export function hubLabel(hub: HubId, lang: Lang, short = false): string {
  const copy = hubCopy(lang, hub);
  return short ? copy.short : copy.label;
}

export function specHref(lang: Lang, path: string | null): string | null {
  if (path == null) return null;
  return langPath(lang, path);
}

/**
 * Flat top-level links for the footer. Home is omitted — the mark already
 * does that job — and dropdown-only parents are skipped.
 */
export function mainNav(lang: Lang) {
  return NAV_SPEC.filter((item) => item.id !== "home" && item.path)
    .map((item) => ({
      href: langPath(lang, item.path as string),
      label: itemLabel(item.id, lang),
    }));
}

/**
 * Pages the primary bar no longer lists, kept for the sheet and the footer.
 */
export function secondaryNav(lang: Lang) {
  const copy = t(lang);
  return [
    { href: langPath(lang, "/places"), label: copy.navPlaces },
    { href: langPath(lang, "/reviews"), label: copy.navReviews },
    { href: langPath(lang, "/transfers/weddings"), label: copy.weddingTransfers },
    { href: langPath(lang, "/partners"), label: copy.navPartners },
  ];
}

const HUB_PATHS = new Set(Object.keys(HUBS).map((id) => `/${id}`));

/** Which top-level item the current path belongs to. */
export function activeNavId(pathname: string): string | null {
  const rest = pathname.replace(/^\/(en|de|it|fr|sv)(?=\/|$)/, "") || "/";
  if (rest === "/tours/boat-cruise") return "boat";
  if (rest === "/" || rest === "") return "home";
  if (rest === "/about" || rest.startsWith("/about/")) return "about";
  if (rest === "/multiday-tours" || rest.startsWith("/multiday-tours/")) return "multiday";
  if (rest === "/transfers" || rest.startsWith("/transfers/")) return "transfer";
  if (rest === "/guides" || rest.startsWith("/guides/")) return "blog";
  if (rest === "/contact" || rest.startsWith("/contact/")) return "contact";
  if (rest === "/tours" || rest.startsWith("/tours/")) return "tours";
  if (rest === "/create" || rest.startsWith("/create/")) return "create";
  const hub = rest.replace(/\/$/, "");
  if (hub === "/multiday-tours") return "multiday";
  if (HUB_PATHS.has(hub)) return "tours";
  return null;
}
