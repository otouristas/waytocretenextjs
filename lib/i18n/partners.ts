import type { Lang } from "./langs";

export type PartnerCopy = {
  seoTitle: string;
  seoDesc: string;
  kicker: string;
  heroTitle: string;
  heroLine: string;
  heroLead: string;
  become: string;
  brochure: string;
  requestRates: string;
  oneTitle: string;
  oneLead: string;
  pillars: { title: string; text: string }[];
  whyTitle: string;
  why: { title: string; text: string }[];
  offerTitle: string;
  offers: { title: string; text: string }[];
  hookKicker: string;
  hookTitle: string;
  hookLead: string;
  hookClose: string;
  howTitle: string;
  steps: { n: string; title: string; text: string }[];
  formTitle: string;
  formLead: string;
  company: string;
  website: string;
  country: string;
  person: string;
  bizEmail: string;
  bizType: string;
  bizTypes: string[];
  interest: string;
  interests: string[];
  volume: string;
  volumes: string[];
  message: string;
  submit: string;
  sent: string;
  ratesNote: string;
  broTitle: string;
  broLead: string;
  broName: string;
  broSubmit: string;
  broSent: string;
};

const EN: PartnerCopy = {
  seoTitle: "Trade & B2B Rates | Crete Tours for Hotels and Agents",
  seoDesc:
    "Agencies and planners: request unpublished net rates for Crete transfers, private days and DMC ops from our Rethymno desk.",
  kicker: "Trade & partners",
  heroTitle: "Your local partner in Crete",
  heroLine: "Private Tours • Transfers • Experiences • Hiking • DMC Services",
  heroLead: "We help travel agencies, tour operators and travel designers deliver exceptional experiences in Crete.",
  become: "Become a Partner",
  brochure: "Download B2B Brochure",
  requestRates: "Request B2B Rates",
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
  hookKicker: "The partnership",
  hookTitle: "You sell the holiday. We take care of Crete.",
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
  company: "Company name",
  website: "Website",
  country: "Country",
  person: "Contact person",
  bizEmail: "Business email",
  bizType: "Type of business",
  bizTypes: ["Travel Agency", "Tour Operator", "Luxury Travel", "DMC"],
  interest: "What are you interested in?",
  interests: ["Transfers", "Private Tours", "Hiking", "VIP / Luxury"],
  volume: "Estimated annual clients to Crete",
  volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Message",
  submit: "Request partnership",
  sent: "Request received. Our trade desk will send B2B rates privately.",
  ratesNote: "B2B net rates are never listed publicly.",
  broTitle: "Download our B2B brochure",
  broLead: "Name, company and email — we send the trade brochure.",
  broName: "Your name",
  broSubmit: "Open brochure",
  broSent: "Brochure unlocked.",
};

const DE: PartnerCopy = {
  seoTitle: "Handels- und B2B-Preise | Kreta-Touren für Hotels und Agenturen",
  seoDesc:
    "Agenturen und Planer: unveröffentlichte Nettopreise für Transfers, private Tage und DMC-Leistungen von unserem Desk in Rethymno anfragen.",
  kicker: "Handel und Partner",
  heroTitle: "Ihr lokaler Partner auf Kreta",
  heroLine: "Private Touren • Transfers • Erlebnisse • Wandern • DMC-Services",
  heroLead:
    "Wir helfen Reisebüros, Veranstaltern und Travel Designern, außergewöhnliche Erlebnisse auf Kreta zu liefern.",
  become: "Partner werden",
  brochure: "B2B-Broschüre herunterladen",
  requestRates: "B2B-Preise anfragen",
  oneTitle: "Ein Partner. Ganz Kreta.",
  oneLead:
    "Von Flughafentransfers bis Wandern und Gastronomie: wir arbeiten vor Ort, damit Ihre Kunden betreut sind.",
  pillars: [
    { title: "Transfers", text: "Flughafen, Hafen, Hotel, privat, Gruppe und VIP." },
    { title: "Private Touren", text: "Chania, Rethymno, Heraklion, Süd- und Ostkreta." },
    { title: "Erlebnisse", text: "Olivenöl, Wein, Kochen, Dörfer, Erzeuger." },
    { title: "Wandern", text: "Samaria, Lefka Ori, Schluchten, nach Maß." },
    { title: "Gruppen", text: "Reisebusse, Mehrtages, Events, Incentives." },
    { title: "VIP", text: "Diskrete Fahrer und Villa-Logistik." },
  ],
  whyTitle: "Warum mit Way to Crete zusammenarbeiten?",
  why: [{ title: "Lokale Expertise", text: "Kreta jenseits der üblichen Touristenstrecken." }],
  offerTitle: "Was wir für Ihre Kunden tun können",
  offers: [{ title: "Transfers", text: "Flughafen • Hafen • Hotel • Privat • Gruppe • VIP" }],
  hookKicker: "Die Partnerschaft",
  hookTitle: "Sie verkaufen den Urlaub. Wir kümmern uns um Kreta.",
  hookLead: "Ihre Kunden brauchen einen zuverlässigen lokalen Partner von der Ankunft bis zur Abreise.",
  hookClose: "Sie bleiben ihr ReisePartner. Wir werden Ihr lokales Team auf Kreta.",
  howTitle: "So läuft es",
  steps: [
    { n: "01", title: "Sie schicken uns die Anfrage", text: "Daten, Reisende und Wünsche." },
    { n: "02", title: "Wir erstellen das Angebot", text: "Route, Verfügbarkeit und privater B2B-Preis." },
    { n: "03", title: "Sie verkaufen es dem Kunden", text: "Sie behalten die Beziehung und den Endpreis." },
    { n: "04", title: "Wir operieren vor Ort", text: "Transport, Erlebnisse und Koordination." },
    { n: "05", title: "Wir betreuen Ihren Kunden", text: "Lokale Hilfe während der gesamten Leistung." },
  ],
  formTitle: "Werden Sie Way-to-Crete-Partner",
  formLead: "Wir antworten mit Partnerkonditionen und einer privaten Preisliste — hier nie veröffentlicht.",
  company: "Firmenname",
  website: "Website",
  country: "Land",
  person: "Ansprechpartner",
  bizEmail: "Geschäftliche E-Mail",
  bizType: "Art des Unternehmens",
  bizTypes: ["Reisebüro", "Veranstalter", "Luxusreisen", "DMC"],
  interest: "Wofür interessieren Sie sich?",
  interests: ["Transfers", "Private Touren", "Wandern", "VIP / Luxury"],
  volume: "Geschätzte jährliche Kunden nach Kreta",
  volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Nachricht",
  submit: "Partnerschaft anfragen",
  sent: "Anfrage erhalten. Unser Handelsdesk schickt die B2B-Preise privat.",
  ratesNote: "B2B-Nettopreise stehen nie öffentlich.",
  broTitle: "Unsere B2B-Broschüre herunterladen",
  broLead: "Name, Firma und E-Mail — wir schicken die Handelsbroschüre.",
  broName: "Ihr Name",
  broSubmit: "Broschüre öffnen",
  broSent: "Broschüre freigeschaltet.",
};

const IT: PartnerCopy = {
  seoTitle: "Tariffe trade e B2B | Tour a Creta per hotel e agenzie",
  seoDesc:
    "Agenzie e planner: chiedete tariffe nette non pubblicate per transfer, giornate private e operazioni DMC dal nostro desk a Rethymno.",
  kicker: "Trade e partner",
  heroTitle: "Il vostro partner locale a Creta",
  heroLine: "Tour privati • Transfer • Esperienze • Trekking • Servizi DMC",
  heroLead:
    "Aiutiamo agenzie, tour operator e travel designer a consegnare esperienze eccezionali a Creta.",
  become: "Diventa partner",
  brochure: "Scarica la brochure B2B",
  requestRates: "Richiedi tariffe B2B",
  oneTitle: "Un partner. Tutta Creta.",
  oneLead:
    "Dai transfer aeroportuali al trekking e alla gastronomia, operiamo in loco così i vostri clienti sono seguiti.",
  pillars: [
    { title: "Transfer", text: "Aeroporto, porto, hotel, privato, gruppo e VIP." },
    { title: "Tour privati", text: "La Canea, Rethymno, Heraklion, Creta sud e est." },
    { title: "Esperienze", text: "Olio, vino, cucina, villaggi, produttori." },
    { title: "Trekking", text: "Samaria, Lefka Ori, gole, su misura." },
    { title: "Gruppi", text: "Pullman, più giorni, eventi, incentive." },
    { title: "VIP", text: "Autisti discreti e logistica ville." },
  ],
  whyTitle: "Perché collaborare con Way to Crete?",
  why: [{ title: "Competenza locale", text: "Creta oltre le rotte turistiche standard." }],
  offerTitle: "Cosa possiamo fare per i vostri clienti",
  offers: [{ title: "Transfer", text: "Aeroporto • Porto • Hotel • Privato • Gruppo • VIP" }],
  hookKicker: "La partnership",
  hookTitle: "Voi vendete la vacanza. Noi ci occupiamo di Creta.",
  hookLead: "I vostri clienti hanno bisogno di un partner locale affidabile dall'arrivo alla partenza.",
  hookClose: "Restate il loro partner di viaggio. Noi diventiamo il vostro team locale a Creta.",
  howTitle: "Come funziona",
  steps: [
    { n: "01", title: "Ci mandate la richiesta", text: "Date, viaggiatori e preferenze." },
    { n: "02", title: "Creiamo la proposta", text: "Itinerario, disponibilità e prezzo B2B privato." },
    { n: "03", title: "La vendete al cliente", text: "Tenete la relazione e il prezzo al pubblico." },
    { n: "04", title: "Operiamo in loco", text: "Trasporto, esperienze e coordinamento." },
    { n: "05", title: "Supportiamo il vostro cliente", text: "Assistenza locale per tutto il servizio." },
  ],
  formTitle: "Diventate partner Way to Crete",
  formLead: "Rispondiamo con i termini di partnership e un listino privato — mai pubblicato qui.",
  company: "Nome azienda",
  website: "Sito web",
  country: "Paese",
  person: "Persona di contatto",
  bizEmail: "Email aziendale",
  bizType: "Tipo di attività",
  bizTypes: ["Agenzia di viaggi", "Tour operator", "Viaggi di lusso", "DMC"],
  interest: "Cosa vi interessa?",
  interests: ["Transfer", "Tour privati", "Trekking", "VIP / Luxury"],
  volume: "Clienti annui stimati verso Creta",
  volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Messaggio",
  submit: "Richiedi partnership",
  sent: "Richiesta ricevuta. Il desk trade invierà le tariffe B2B in privato.",
  ratesNote: "Le tariffe nette B2B non sono mai elencate in pubblico.",
  broTitle: "Scaricate la nostra brochure B2B",
  broLead: "Nome, azienda e email — inviamo la brochure trade.",
  broName: "Il vostro nome",
  broSubmit: "Apri brochure",
  broSent: "Brochure sbloccata.",
};

const FR: PartnerCopy = {
  seoTitle: "Tarifs trade et B2B | Excursions en Crète pour hôtels et agences",
  seoDesc:
    "Agences et planners : demandez des tarifs nets non publiés pour les transferts, journées privées et opérations DMC depuis notre desk à Réthymnon.",
  kicker: "Trade et partenaires",
  heroTitle: "Votre partenaire local en Crète",
  heroLine: "Excursions privées • Transferts • Expériences • Randonnée • Services DMC",
  heroLead:
    "Nous aidons les agences, tour-opérateurs et travel designers à livrer des expériences exceptionnelles en Crète.",
  become: "Devenir partenaire",
  brochure: "Télécharger la brochure B2B",
  requestRates: "Demander les tarifs B2B",
  oneTitle: "Un partenaire. Toute la Crète.",
  oneLead:
    "Des transferts aéroport à la randonnée et à la gastronomie, nous opérons sur place pour que vos clients soient pris en charge.",
  pillars: [
    { title: "Transferts", text: "Aéroport, port, hôtel, privé, groupe et VIP." },
    { title: "Excursions privées", text: "La Canée, Réthymnon, Héraklion, Crète sud et est." },
    { title: "Expériences", text: "Huile d'olive, vin, cuisine, villages, producteurs." },
    { title: "Randonnée", text: "Samaria, Lefka Ori, gorges, sur mesure." },
    { title: "Groupes", text: "Cars, plusieurs jours, événements, incentives." },
    { title: "VIP", text: "Chauffeurs discrets et logistique villas." },
  ],
  whyTitle: "Pourquoi s'associer à Way to Crete ?",
  why: [{ title: "Expertise locale", text: "La Crète au-delà des circuits touristiques habituels." }],
  offerTitle: "Ce que nous pouvons faire pour vos clients",
  offers: [{ title: "Transferts", text: "Aéroport • Port • Hôtel • Privé • Groupe • VIP" }],
  hookKicker: "Le partenariat",
  hookTitle: "Vous vendez les vacances. Nous nous occupons de la Crète.",
  hookLead: "Vos clients ont besoin d'un partenaire local fiable de l'arrivée au départ.",
  hookClose: "Vous restez leur partenaire de voyage. Nous devenons votre équipe locale en Crète.",
  howTitle: "Comment ça marche",
  steps: [
    { n: "01", title: "Vous nous envoyez la demande", text: "Dates, voyageurs et préférences." },
    { n: "02", title: "Nous créons la proposition", text: "Itinéraire, disponibilité et tarif B2B privé." },
    { n: "03", title: "Vous la vendez à votre client", text: "Vous gardez la relation et le prix public." },
    { n: "04", title: "Nous opérons sur place", text: "Transport, expériences et coordination." },
    { n: "05", title: "Nous accompagnons votre client", text: "Assistance locale pendant tout le service." },
  ],
  formTitle: "Devenez partenaire Way to Crete",
  formLead: "Nous répondons avec les conditions de partenariat et une grille privée — jamais publiée ici.",
  company: "Nom de l'entreprise",
  website: "Site web",
  country: "Pays",
  person: "Personne de contact",
  bizEmail: "E-mail professionnel",
  bizType: "Type d'activité",
  bizTypes: ["Agence de voyages", "Tour-opérateur", "Voyage de luxe", "DMC"],
  interest: "Qu'est-ce qui vous intéresse ?",
  interests: ["Transferts", "Excursions privées", "Randonnée", "VIP / Luxury"],
  volume: "Clients annuels estimés vers la Crète",
  volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Message",
  submit: "Demander un partenariat",
  sent: "Demande reçue. Notre desk trade enverra les tarifs B2B en privé.",
  ratesNote: "Les tarifs nets B2B ne sont jamais listés publiquement.",
  broTitle: "Téléchargez notre brochure B2B",
  broLead: "Nom, entreprise et e-mail — nous envoyons la brochure trade.",
  broName: "Votre nom",
  broSubmit: "Ouvrir la brochure",
  broSent: "Brochure déverrouillée.",
};

const SV: PartnerCopy = {
  seoTitle: "Trade- och B2B-priser | Kretaturer för hotell och byråer",
  seoDesc:
    "Byråer och planners: begär opublicerade nettopriser för transfer, privata dagar och DMC-verksamhet från vårt desk i Rethymno.",
  kicker: "Trade och partners",
  heroTitle: "Er lokala partner på Kreta",
  heroLine: "Privata turer • Transfer • Upplevelser • Vandring • DMC-tjänster",
  heroLead:
    "Vi hjälper resebyråer, arrangörer och travel designers att leverera exceptionella upplevelser på Kreta.",
  become: "Bli partner",
  brochure: "Ladda ner B2B-broschyren",
  requestRates: "Begär B2B-priser",
  oneTitle: "En partner. Hela Kreta.",
  oneLead:
    "Från flygplatstransfer till vandring och gastronomi: vi opererar på plats så att era kunder tas om hand.",
  pillars: [
    { title: "Transfer", text: "Flygplats, hamn, hotell, privat, grupp och VIP." },
    { title: "Privata turer", text: "Chania, Rethymno, Heraklion, södra och östra Kreta." },
    { title: "Upplevelser", text: "Olivolja, vin, matlagning, byar, producenter." },
    { title: "Vandring", text: "Samaria, Lefka Ori, raviner, skräddarsytt." },
    { title: "Grupper", text: "Bussar, flera dagar, event, incentives." },
    { title: "VIP", text: "Diskreta chaufförer och villalogistik." },
  ],
  whyTitle: "Varför samarbeta med Way to Crete?",
  why: [{ title: "Lokal expertis", text: "Kreta bortom de vanliga turiststråken." }],
  offerTitle: "Vad vi kan göra för era kunder",
  offers: [{ title: "Transfer", text: "Flygplats • Hamn • Hotell • Privat • Grupp • VIP" }],
  hookKicker: "Partnerskapet",
  hookTitle: "Ni säljer semestern. Vi tar hand om Kreta.",
  hookLead: "Era kunder behöver en pålitlig lokal partner från ankomst till avresa.",
  hookClose: "Ni förblir deras resepartner. Vi blir ert lokala team på Kreta.",
  howTitle: "Så fungerar det",
  steps: [
    { n: "01", title: "Ni skickar förfrågan", text: "Datum, resenärer och önskemål." },
    { n: "02", title: "Vi tar fram förslaget", text: "Resplan, tillgänglighet och privat B2B-pris." },
    { n: "03", title: "Ni säljer det till kunden", text: "Ni behåller relationen och slutpriset." },
    { n: "04", title: "Vi opererar på plats", text: "Transport, upplevelser och samordning." },
    { n: "05", title: "Vi stöttar er kund", text: "Lokal hjälp under hela tjänsten." },
  ],
  formTitle: "Bli Way to Crete-partner",
  formLead: "Vi svarar med partnerskapsvillkor och en privat prislista — aldrig publicerad här.",
  company: "Företagsnamn",
  website: "Webbplats",
  country: "Land",
  person: "Kontaktperson",
  bizEmail: "Företagsmejl",
  bizType: "Typ av verksamhet",
  bizTypes: ["Resebyrå", "Arrangör", "Lyxresor", "DMC"],
  interest: "Vad är ni intresserade av?",
  interests: ["Transfer", "Privata turer", "Vandring", "VIP / Luxury"],
  volume: "Uppskattade årliga kunder till Kreta",
  volumes: ["1–50", "50–200", "200–500", "500+"],
  message: "Meddelande",
  submit: "Begär partnerskap",
  sent: "Förfrågan mottagen. Vårt tradedesk skickar B2B-priserna privat.",
  ratesNote: "B2B-nettopriser listas aldrig offentligt.",
  broTitle: "Ladda ner vår B2B-broschyr",
  broLead: "Namn, företag och mejl — vi skickar trade-broschyren.",
  broName: "Ert namn",
  broSubmit: "Öppna broschyren",
  broSent: "Broschyren olåst.",
};

export const PARTNERS: Record<Lang, PartnerCopy> = {
  en: EN,
  de: DE,
  it: IT,
  fr: FR,
  sv: SV,
};

export function partnersCopy(lang: Lang) {
  return PARTNERS[lang] ?? EN;
}
