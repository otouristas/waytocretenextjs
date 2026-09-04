import type { Lang } from "./langs";

export type PartnerCopy = {
  seoTitle: string; seoDesc: string; kicker: string; heroTitle: string; heroLine: string; heroLead: string;
  become: string; brochure: string; requestRates: string; oneTitle: string; oneLead: string;
  pillars: { title: string; text: string }[]; whyTitle: string; why: { title: string; text: string }[];
  offerTitle: string; offers: { title: string; text: string }[]; hookKicker: string; hookTitle: string;
  hookLead: string; hookClose: string; howTitle: string; steps: { n: string; title: string; text: string }[];
  formTitle: string; formLead: string; company: string; website: string; country: string; person: string;
  bizEmail: string; bizType: string; bizTypes: string[]; interest: string; interests: string[]; volume: string;
  volumes: string[]; message: string; submit: string; sent: string; ratesNote: string; broTitle: string;
  broLead: string; broName: string; broSubmit: string; broSent: string;
};

const EN: PartnerCopy = {
  seoTitle: "B2B Partners in Crete | Transfers, Private Tours, DMC | Way to Crete",
  seoDesc: "Travel agencies and tour operators: partner with Way to Crete. Request B2B rates.",
  kicker: "Trade & partners", heroTitle: "Your local partner in Crete",
  heroLine: "Private Tours • Transfers • Experiences • Hiking • DMC Services",
  heroLead: "We help travel agencies, tour operators and travel designers deliver exceptional experiences in Crete.",
  become: "Become a Partner", brochure: "Download B2B Brochure", requestRates: "Request B2B Rates",
  oneTitle: "One partner. The whole of Crete.",
  oneLead: "From airport transfers to hiking and gastronomy, we operate locally so your clients are looked after.",
  pillars: [
    { title: "Transfers", text: "Airport, port, hotel, private, group and VIP." },
    { title: "Private Tours", text: "Chania, Rethymno, Heraklion, south and east Crete." },
    { title: "Experiences", text: "Olive oil, wine, cooking, villages, producers." },
    { title: "Hiking", text: "Samaria, White Mountains, gorges, bespoke." },
    { title: "Groups", text: "Coaches, multi-day, events, incentives." },
    { title: "VIP", text: "Discreet drivers and villa logistics." },
  ],
  whyTitle: "Why partner with Way to Crete?",
  why: [{ title: "Local expertise", text: "Crete beyond the standard tourist routes." }],
  offerTitle: "What we can do for your clients",
  offers: [{ title: "Transfers", text: "Airport • Port • Hotel • Private • Group • VIP" }],
  hookKicker: "The partnership", hookTitle: "You sell the holiday. We take care of Crete.",
  hookLead: "Your clients need a reliable local partner from arrival to departure.",
  hookClose: "You remain their travel partner. We become your local team in Crete.",
  howTitle: "How it works",
  steps: [
    { n: "01", title: "You send us the request", text: "Dates, travellers and preferences." },
    { n: "02", title: "We create the proposal", text: "Itinerary, availability and private B2B price." },
    { n: "03", title: "You sell it to your client", text: "You keep the relationship and retail price." },
    { n: "04", title: "We operate locally", text: "Transport, experiences and coordination." },
    { n: "05", title: "We support your client", text: "Local assistance throughout the service." },
  ],
  formTitle: "Become a Way to Crete partner",
  formLead: "We reply with partnership terms and a private rate card — never published here.",
  company: "Company name", website: "Website", country: "Country", person: "Contact person", bizEmail: "Business email",
  bizType: "Type of business", bizTypes: ["Travel Agency", "Tour Operator", "Luxury Travel", "DMC"],
  interest: "What are you interested in?", interests: ["Transfers", "Private Tours", "Hiking", "VIP / Luxury"],
  volume: "Estimated annual clients to Crete", volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Message", submit: "Request partnership",
  sent: "Request received. Our trade desk will send B2B rates privately.",
  ratesNote: "B2B net rates are never listed publicly.",
  broTitle: "Download our B2B brochure", broLead: "Name, company and email — we send the trade brochure.",
  broName: "Your name", broSubmit: "Open brochure", broSent: "Brochure unlocked.",
};

export const PARTNERS: Record<Lang, PartnerCopy> = {
  en: EN,
  el: { ...EN, heroTitle: "Ο τοπικός σας συνεργάτης στην Κρήτη", become: "Γίνετε συνεργάτης" },
  de: { ...EN, heroTitle: "Ihr lokaler Partner auf Kreta", become: "Partner werden" },
  it: { ...EN, heroTitle: "Il vostro partner locale a Creta", become: "Diventa partner" },
  fr: { ...EN, heroTitle: "Votre partenaire local en Crète", become: "Devenir partenaire" },
  sv: { ...EN, heroTitle: "Er lokala partner på Kreta", become: "Bli partner" },
};

export function partnersCopy(lang: Lang) {
  return PARTNERS[lang] ?? EN;
}
