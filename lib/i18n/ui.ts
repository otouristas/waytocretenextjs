import type { Lang } from "./langs";

export type UI = {
  brand: string;
  tagline: string;
  navTours: string;
  navAbout: string;
  navPartners: string;
  navContact: string;
  bookNow: string;
  searchCta: string;
  searchWhere: string;
  searchWhen: string;
  searchGuests: string;
  guests: string;
  viewAll: string;
  fromPrice: string;
  perPerson: string;
  perGroup: string;
  hours: string;
  reviews: string;
  pickup: string;
  photoshoot: string;
  privateTour: string;
  freeCancel: string;
  smallGroup: string;
  highlights: string;
  itinerary: string;
  included: string;
  notIncluded: string;
  meetingPoint: string;
  bookThis: string;
  selectDate: string;
  total: string;
  availability: string;
  checkAvail: string;
  whyUs: string;
  stories: string;
  faq: string;
  getInTouch: string;
  phone: string;
  email: string;
  name: string;
  message: string;
  send: string;
  hotel: string;
  submitted: string;
  wishlist: string;
  saved: string;
  emptyTours: string;
  sort: string;
  sortPopular: string;
  sortPrice: string;
  sortDuration: string;
  filter: string;
  all: string;
  aboutTitle: string;
  aboutLead: string;
  aboutBody: string;
  ernest: string;
  contactTitle: string;
  contactLead: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  premium: string;
  pointsTitle: string;
  footerNav: string;
  footerTours: string;
  newsletter: string;
  rights: string;
  home: string;
  results: string;
  difficulty: string;
  easy: string;
  moderate: string;
  hard: string;
  confirm: string;
  requestSent: string;
  backTours: string;
  rating: string;
  languages: string;
  categories: Record<string, string>;
  points: string[];
  faqs: { q: string; a: string }[];
  reviewsList: { name: string; text: string; tour: string }[];
};

const EN: UI = {
  brand: "Way to Crete",
  tagline: "Don't visit Crete. Belong to it.",
  navTours: "Tours",
  navAbout: "About",
  navPartners: "Partners",
  navContact: "Contact",
  bookNow: "Book now",
  searchCta: "Search experiences",
  searchWhere: "Experience or place",
  searchWhen: "Date",
  searchGuests: "Travelers",
  guests: "Travelers",
  viewAll: "View all tours",
  fromPrice: "From",
  perPerson: "per person",
  perGroup: "per private group",
  hours: "hours",
  reviews: "reviews",
  pickup: "Hotel pickup",
  photoshoot: "Photoshoot included",
  privateTour: "Private",
  freeCancel: "Free cancellation",
  smallGroup: "Small group",
  highlights: "Highlights",
  itinerary: "Itinerary",
  included: "What's included",
  notIncluded: "Not included",
  meetingPoint: "Meeting point",
  bookThis: "Reserve this experience",
  selectDate: "Choose a date",
  total: "Total",
  availability: "Check availability",
  checkAvail: "Hold my spot",
  whyUs: "Why locals book with us",
  stories: "Stories from the path",
  faq: "Questions before you pack",
  getInTouch: "Get in touch",
  phone: "Phone",
  email: "Email",
  name: "Full name",
  message: "How can we host you?",
  send: "Send request",
  hotel: "Hotel or villa in Crete",
  submitted: "Request received. Ernest will reply within a few hours.",
  wishlist: "Saved",
  saved: "Saved for later",
  emptyTours: "No experiences match those filters.",
  sort: "Sort",
  sortPopular: "Most booked",
  sortPrice: "Price",
  sortDuration: "Duration",
  filter: "Filter",
  all: "All",
  aboutTitle: "Storytellers and local hosts from Rethymno",
  aboutLead: "We are not a bus company. We are Cretans who still walk the same goat paths we learned as children.",
  aboutBody: "Way to Crete grew from Ernest's life on the island — sea, mountains, villages, monasteries and quiet beaches.",
  ernest: "Ernest grew up in Crete and treats guests like family arriving from Athens.",
  contactTitle: "Plan a private day in Crete",
  contactLead: "Tell us your hotel, pace, and what you want to feel.",
  heroKicker: "Private tours from Rethymno · 5.0 from 148 guests",
  heroTitle: "Crete tours you remember with your feet, not your camera roll.",
  heroSub: "Storytelling hikes, village tables, pink-sand beaches, and hidden gorges.",
  premium: "Signature experiences",
  pointsTitle: "How we host",
  footerNav: "Explore",
  footerTours: "Crete tours",
  newsletter: "Season notes from the island",
  rights: "Way to Crete · Rethymno, Crete, Greece",
  home: "Home",
  results: "experiences",
  difficulty: "Difficulty",
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
  confirm: "Request to book",
  requestSent: "Your request is with our Rethymno desk.",
  backTours: "All experiences",
  rating: "Guest rating",
  languages: "Language",
  categories: {
    hiking: "Hiking",
    gastronomy: "Food & wine",
    culture: "Culture",
    beach: "Beaches",
    wellness: "Wellness",
    signature: "Signature",
    nature: "Nature",
  },
  points: [
    "Expert local guides born on Crete",
    "Small groups — never a coach tour",
    "Pickup from Rethymno hotels and villas",
    "Professional photoshoot on every experience",
  ],
  faqs: [
    { q: "Where do tours start?", a: "Most days begin with hotel pickup in Rethymno." },
    { q: "Are experiences private?", a: "Signature days are private. Other tours stay in groups of 8 or fewer." },
  ],
  reviewsList: [
    { name: "Emma D.", tour: "South Crete Highlights", text: "Honeymoon day done right." },
    { name: "Mari J.", tour: "Taste of Crete", text: "No mass tourism. Unbeatable value." },
  ],
};

export const UI: Record<Lang, UI> = {
  en: EN,
  el: { ...EN, navTours: "Εκδρομές", navAbout: "Σχετικά", navPartners: "Συνεργάτες", navContact: "Επικοινωνία", tagline: "Μην επισκεφθείς την Κρήτη. Ανήκε σ' αυτήν." },
  de: { ...EN, navTours: "Touren", navAbout: "Über uns", navPartners: "Partner", navContact: "Kontakt", tagline: "Besuche Kreta nicht. Gehöre dazu." },
  it: { ...EN, navTours: "Tour", navAbout: "Chi siamo", navPartners: "Partner", navContact: "Contatti" },
  fr: { ...EN, navTours: "Circuits", navAbout: "À propos", navPartners: "Partenaires", navContact: "Contact" },
  sv: { ...EN, navTours: "Turer", navAbout: "Om oss", navPartners: "Partner", navContact: "Kontakt" },
};

export function t(lang: Lang) {
  return UI[lang] ?? EN;
}
