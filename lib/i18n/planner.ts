import type { Lang } from "./langs";
import type { PlannerAddon, PlannerInterest } from "@/lib/content/schema";

export type PlannerCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  seoTitle: string;
  seoDescription: string;
  start: string;
  people: string;
  date: string;
  interestsHeading: string;
  createDay: string;
  weCreated: string;
  useThis: string;
  changeStops: string;
  yourTrip: string;
  driving: string;
  stays: string;
  total: string;
  billed: string;
  minNote: string;
  privateTour: string;
  bookMyTour: string;
  add: string;
  added: string;
  remove: string;
  suggestedStay: string;
  stay: string;
  addons: string;
  addonHint: string;
  photoshoot: string;
  longWarn: string;
  rewrite: string;
  packagedLead: string;
  bookPackaged: string;
  keepCustom: string;
  bookTitle: string;
  name: string;
  email: string;
  hotel: string;
  phone: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  submitted: string;
  whatsapp: string;
  share: string;
  copied: string;
  openMaps: string;
  emptyTrip: string;
  pickInterests: string;
  all: string;
  included: string;
  fromPrice: string;
  guests: string;
  categories: Record<PlannerInterest, string>;
  addonsLabel: Record<PlannerAddon, string>;
  startsHint: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  homeEyebrow: string;
  homeTitle: string;
  homeLead: string;
  homeCta: string;
  addToDay: string;
  buildDifferent: string;
  nav: string;
};

const EN: PlannerCopy = {
  eyebrow: "Private day · from €250",
  title: "Create your own Crete experience",
  lead: "Tell us where you start and what you want. We write a private day, you add or drop stops, and the hours and price move with you. Five hours minimum. You never have to guess how long to book.",
  seoTitle: "Create Your Own Crete Day | Private Tour from Rethymno",
  seoDescription:
    "Build a private Crete day from Rethymno: pick beaches, villages, wine or history, see the route on the map, and get a live price from €250.",
  start: "Where do you start?",
  people: "People",
  date: "Date",
  interestsHeading: "What would you like to experience?",
  createDay: "Create this day",
  weCreated: "We created this trip for you",
  useThis: "Use this day",
  changeStops: "Change a stop",
  yourTrip: "Your trip",
  driving: "Driving",
  stays: "Stops",
  total: "Total",
  billed: "billed",
  minNote: "Minimum 5 hours",
  privateTour: "Private tour",
  bookMyTour: "Book my tour",
  add: "Add",
  added: "Added",
  remove: "Remove",
  suggestedStay: "Suggested stay",
  stay: "Stay",
  addons: "Add to the day",
  addonHint: "These are requests. The desk confirms what is possible and the extra, if any.",
  photoshoot: "Professional photoshoot included",
  longWarn: "This itinerary may be quite long. We recommend removing one stop or extending your tour.",
  rewrite: "Fix this day",
  packagedLead: "This is essentially our {title} day — usually cheaper as a ready-made tour.",
  bookPackaged: "See the ready-made day",
  keepCustom: "Keep customising",
  bookTitle: "Hold this day",
  name: "Name",
  email: "Email",
  hotel: "Hotel or villa",
  phone: "Phone or WhatsApp",
  message: "Anything we should know",
  send: "Send request",
  sending: "Sending…",
  sent: "Request sent",
  submitted: "The desk has your day. Someone who hosts it will confirm within a few hours.",
  whatsapp: "WhatsApp this day",
  share: "Copy link",
  copied: "Link copied",
  openMaps: "Open this day in Google Maps",
  emptyTrip: "Add a stop from the cards, or pick what you would like and we will write a day.",
  pickInterests: "Pick at least one, or skip and build from the map.",
  all: "All",
  included: "Private van, English-speaking driver, hotel pickup, photoshoot, water.",
  fromPrice: "From",
  guests: "guests",
  categories: {
    beach: "Beaches",
    villages: "Villages",
    food: "Cretan food",
    wine: "Wine",
    history: "History",
    hiking: "Hiking",
    hidden: "Hidden places",
    nature: "Nature",
  },
  addonsLabel: {
    guide: "Licensed guide",
    lunch: "Village lunch",
    wine: "Wine tasting",
    experience: "Extra experience",
  },
  startsHint: "We collect from the Rethymno area as standard. Chania and the airports are possible — the drive is part of the day.",
  faqTitle: "How a custom day works",
  faqs: [
    {
      q: "How is the price calculated?",
      a: "Driving time plus time at each stop, rounded up to the next half hour, with a five-hour minimum. €50 per hour for 1–4 guests, €60 per hour for 5–8. The live total on the page is the same figure the desk receives.",
    },
    {
      q: "Do I need to know how many hours to book?",
      a: "No. Add the places you want and we bill the time the route actually takes, including the drive home.",
    },
    {
      q: "Can I visit Elafonisi and Preveli in one day?",
      a: "No. They sit on opposite sides of the island. The planner will stop that combination and offer one coast.",
    },
    {
      q: "Is this a private tour?",
      a: "Yes. One van, your party only, up to eight guests. A professional photoshoot is included. A licensed guide, lunch and wine tasting can be requested.",
    },
    {
      q: "How do I pay?",
      a: "You send the day as a request. We confirm the date, then send how to pay. Nothing is charged on this site.",
    },
  ],
  homeEyebrow: "New",
  homeTitle: "Or write the day yourself",
  homeLead: "A private Crete day on a map: pick a feeling, add Preveli or Spili, and watch the hours and price move.",
  homeCta: "Create your day",
  addToDay: "Add to a custom day",
  buildDifferent: "Want a different mix? Build this day yourself.",
  nav: "Create your day",
};

const DE: PlannerCopy = {
  ...EN,
  eyebrow: "Privater Tag · ab 250 €",
  title: "Gestalten Sie Ihren Kreta-Tag",
  lead: "Start, Interessen, Karte. Fahrzeit und Stops ergeben den Preis — mindestens fünf Stunden. Sie müssen die Stunden nicht schätzen.",
  seoTitle: "Eigenen Kreta-Tag planen | Privattour ab Rethymno",
  seoDescription:
    "Privater Kreta-Tag ab Rethymno: Strände, Dörfer, Wein oder Geschichte wählen, Route auf der Karte sehen, Preis live ab 250 €.",
  start: "Wo starten Sie?",
  people: "Personen",
  date: "Datum",
  interestsHeading: "Was möchten Sie erleben?",
  createDay: "Tag erstellen",
  weCreated: "Wir haben diese Tour für Sie gelegt",
  useThis: "Diesen Tag nehmen",
  changeStops: "Stopp ändern",
  yourTrip: "Ihre Tour",
  driving: "Fahrt",
  stays: "Stops",
  total: "Gesamt",
  billed: "berechnet",
  minNote: "Mindestens 5 Stunden",
  privateTour: "Privattour",
  bookMyTour: "Tour anfragen",
  add: "Hinzufügen",
  added: "Dabei",
  remove: "Entfernen",
  suggestedStay: "Vorgeschlagene Zeit",
  stay: "Aufenthalt",
  addons: "Zum Tag hinzufügen",
  addonHint: "Wünsche an den Desk. Aufpreis bestätigen wir persönlich.",
  photoshoot: "Professionelles Fotoshooting inklusive",
  longWarn: "Diese Route ist ziemlich lang. Ein Stopp weniger — oder der Tag länger.",
  rewrite: "Tag korrigieren",
  packagedLead: "Das ist im Kern unser {title} — als fertige Tour meist günstiger.",
  bookPackaged: "Fertige Tour ansehen",
  keepCustom: "Weiter anpassen",
  bookTitle: "Tag halten",
  name: "Name",
  email: "E-Mail",
  hotel: "Hotel oder Villa",
  phone: "Telefon oder WhatsApp",
  message: "Was wir wissen sollten",
  send: "Anfrage senden",
  sending: "Senden…",
  sent: "Anfrage gesendet",
  submitted: "Der Desk hat Ihren Tag. Jemand, der ihn fährt, bestätigt in wenigen Stunden.",
  whatsapp: "Per WhatsApp senden",
  share: "Link kopieren",
  copied: "Kopiert",
  openMaps: "In Google Maps öffnen",
  emptyTrip: "Einen Stopp von den Karten wählen — oder Interessen ankreuzen, wir legen den Tag.",
  pickInterests: "Mindestens eines, oder direkt auf der Karte bauen.",
  all: "Alle",
  included: "Privater Van, englischsprachiger Fahrer, Hotelabholung, Fotoshooting, Wasser.",
  fromPrice: "Ab",
  guests: "Gäste",
  categories: {
    beach: "Strände",
    villages: "Dörfer",
    food: "Kretische Küche",
    wine: "Wein",
    history: "Geschichte",
    hiking: "Wandern",
    hidden: "Versteckte Orte",
    nature: "Natur",
  },
  addonsLabel: {
    guide: "Lizenzierter Guide",
    lunch: "Dorflunch",
    wine: "Weinprobe",
    experience: "Extra Erlebnis",
  },
  startsHint: "Abholung im Raum Rethymno ist Standard. Chania und die Flughäfen gehen — die Fahrt gehört zum Tag.",
  faqTitle: "So funktioniert ein Wunschtag",
  faqs: [
    {
      q: "Wie wird der Preis berechnet?",
      a: "Fahrzeit plus Zeit an den Stops, auf die nächste halbe Stunde aufgerundet, mindestens fünf Stunden. 50 €/h für 1–4 Gäste, 60 €/h für 5–8.",
    },
    {
      q: "Muss ich die Stunden kennen?",
      a: "Nein. Sie wählen Orte; wir berechnen die echte Routenzeit inklusive Rückfahrt.",
    },
    {
      q: "Elafonisi und Preveli an einem Tag?",
      a: "Nein. Das sind gegenüberliegende Küsten. Der Planer blockiert die Kombination.",
    },
    {
      q: "Ist das privat?",
      a: "Ja. Ein Van, nur Ihre Gruppe, bis acht Gäste. Fotoshooting inklusive.",
    },
    {
      q: "Wie zahle ich?",
      a: "Sie senden eine Anfrage. Wir bestätigen das Datum und schicken die Zahlung. Hier wird nichts abgebucht.",
    },
  ],
  homeEyebrow: "Neu",
  homeTitle: "Oder schreiben Sie den Tag selbst",
  homeLead: "Ein privater Kreta-Tag auf der Karte: Gefühl wählen, Preveli oder Spili dazunehmen, Stunden und Preis live.",
  homeCta: "Tag gestalten",
  addToDay: "Zu einem Wunschtag hinzufügen",
  buildDifferent: "Andere Mischung? Bauen Sie den Tag selbst.",
  nav: "Tag gestalten",
};

const IT: PlannerCopy = {
  ...EN,
  eyebrow: "Giornata privata · da 250 €",
  title: "Crea la tua esperienza a Creta",
  lead: "Partenza, cosa vuoi vedere, mappa. Guida e soste fanno il prezzo — minimo cinque ore. Non devi indovinare le ore.",
  seoTitle: "Crea il tuo giorno a Creta | Tour privato da Rethymno",
  seoDescription:
    "Tour privato a Creta da Rethymno: spiagge, borghi, vino o storia, itinerario sulla mappa, prezzo live da 250 €.",
  start: "Da dove parti?",
  people: "Persone",
  date: "Data",
  interestsHeading: "Cosa vuoi vivere?",
  createDay: "Crea questa giornata",
  weCreated: "Abbiamo creato questo viaggio per te",
  useThis: "Usa questa giornata",
  changeStops: "Cambia una tappa",
  yourTrip: "Il tuo viaggio",
  driving: "Guida",
  stays: "Tappe",
  total: "Totale",
  billed: "fatturate",
  minNote: "Minimo 5 ore",
  privateTour: "Tour privato",
  bookMyTour: "Prenota il tour",
  add: "Aggiungi",
  added: "Aggiunto",
  remove: "Togli",
  suggestedStay: "Sosta consigliata",
  stay: "Sosta",
  addons: "Aggiungi alla giornata",
  addonHint: "Richieste al desk. L’eventuale extra lo confermiamo noi.",
  photoshoot: "Servizio fotografico incluso",
  longWarn: "Itinerario piuttosto lungo. Togli una tappa o allunga il tour.",
  rewrite: "Correggi la giornata",
  packagedLead: "È in pratica il nostro {title} — di solito costa meno già confezionato.",
  bookPackaged: "Vedi il tour pronto",
  keepCustom: "Continua a personalizzare",
  bookTitle: "Tieni questa data",
  name: "Nome",
  email: "Email",
  hotel: "Hotel o villa",
  phone: "Telefono o WhatsApp",
  message: "Cosa dobbiamo sapere",
  send: "Invia richiesta",
  sending: "Invio…",
  sent: "Richiesta inviata",
  submitted: "Il desk ha la tua giornata. Chi la guida conferma in poche ore.",
  whatsapp: "Invia su WhatsApp",
  share: "Copia link",
  copied: "Copiato",
  openMaps: "Apri in Google Maps",
  emptyTrip: "Aggiungi una tappa dalle schede, oppure dimci cosa vuoi e la scriviamo noi.",
  pickInterests: "Almeno uno, oppure costruisci dalla mappa.",
  all: "Tutti",
  included: "Van privato, autista in inglese, pickup, servizio foto, acqua.",
  fromPrice: "Da",
  guests: "ospiti",
  categories: {
    beach: "Spiagge",
    villages: "Borghi",
    food: "Cucina cretese",
    wine: "Vino",
    history: "Storia",
    hiking: "Trekking",
    hidden: "Luoghi nascosti",
    nature: "Natura",
  },
  addonsLabel: {
    guide: "Guida abilitata",
    lunch: "Pranzo in paese",
    wine: "Degustazione",
    experience: "Esperienza extra",
  },
  startsHint: "Il ritiro nell’area di Rethymno è lo standard. Chania e gli aeroporti si fanno — il tragitto è parte del giorno.",
  faqTitle: "Come funziona un giorno su misura",
  faqs: EN.faqs,
  homeEyebrow: "Nuovo",
  homeTitle: "Oppure scrivi tu la giornata",
  homeLead: "Un giorno privato su una mappa: scegli un’atmosfera, aggiungi Preveli o Spili, ore e prezzo si muovono.",
  homeCta: "Crea la tua giornata",
  addToDay: "Aggiungi a un giorno su misura",
  buildDifferent: "Un mix diverso? Costruisci tu la giornata.",
  nav: "Crea la tua giornata",
};

const FR: PlannerCopy = {
  ...EN,
  eyebrow: "Journée privée · dès 250 €",
  title: "Créez votre expérience crétoise",
  lead: "Départ, envies, carte. Conduite et pauses font le prix — cinq heures minimum. Pas besoin de deviner la durée.",
  seoTitle: "Créez votre journée en Crète | Circuit privé depuis Réthymnon",
  seoDescription:
    "Journée privée en Crète depuis Réthymnon : plages, villages, vin ou histoire, itinéraire sur la carte, prix en direct dès 250 €.",
  start: "D’où partez-vous ?",
  people: "Personnes",
  date: "Date",
  interestsHeading: "Que voulez-vous vivre ?",
  createDay: "Créer cette journée",
  weCreated: "Nous avons composé ce voyage pour vous",
  useThis: "Garder cette journée",
  changeStops: "Modifier une étape",
  yourTrip: "Votre trajet",
  driving: "Route",
  stays: "Étapes",
  total: "Total",
  billed: "facturées",
  minNote: "Minimum 5 heures",
  privateTour: "Circuit privé",
  bookMyTour: "Réserver",
  add: "Ajouter",
  added: "Ajouté",
  remove: "Retirer",
  suggestedStay: "Pause suggérée",
  stay: "Pause",
  addons: "Ajouter à la journée",
  addonHint: "Ce sont des demandes. Le desk confirme le possible, et le supplément s’il y en a.",
  photoshoot: "Séance photo professionnelle incluse",
  longWarn: "Itinéraire un peu long. Enlevez une étape, ou allongez la journée.",
  rewrite: "Corriger la journée",
  packagedLead: "C’est essentiellement notre {title} — souvent moins cher en formule prête.",
  bookPackaged: "Voir la journée prête",
  keepCustom: "Continuer à composer",
  bookTitle: "Réserver cette date",
  name: "Nom",
  email: "E-mail",
  hotel: "Hôtel ou villa",
  phone: "Téléphone ou WhatsApp",
  message: "À savoir",
  send: "Envoyer la demande",
  sending: "Envoi…",
  sent: "Demande envoyée",
  submitted: "Le desk a votre journée. Qui la mène confirmera sous quelques heures.",
  whatsapp: "Envoyer sur WhatsApp",
  share: "Copier le lien",
  copied: "Copié",
  openMaps: "Ouvrir dans Google Maps",
  emptyTrip: "Ajoutez une étape, ou dites-nous ce que vous voulez et nous écrivons la journée.",
  pickInterests: "Au moins un choix, ou construisez depuis la carte.",
  all: "Tout",
  included: "Van privé, chauffeur anglophone, prise en charge, photos, eau.",
  fromPrice: "Dès",
  guests: "voyageurs",
  categories: {
    beach: "Plages",
    villages: "Villages",
    food: "Cuisine crétoise",
    wine: "Vin",
    history: "Histoire",
    hiking: "Randonnée",
    hidden: "Lieux cachés",
    nature: "Nature",
  },
  addonsLabel: {
    guide: "Guide diplômé",
    lunch: "Déjeuner au village",
    wine: "Dégustation",
    experience: "Expérience en plus",
  },
  startsHint: "Prise en charge autour de Réthymnon par défaut. La Canée et les aéroports sont possibles — la route compte dans la journée.",
  faqTitle: "Comment marche une journée sur mesure",
  faqs: EN.faqs,
  homeEyebrow: "Nouveau",
  homeTitle: "Ou écrivez la journée vous-même",
  homeLead: "Une journée privée sur une carte : choisissez une envie, ajoutez Preveli ou Spili, heures et prix bougent.",
  homeCta: "Créer votre journée",
  addToDay: "Ajouter à une journée sur mesure",
  buildDifferent: "Un autre mélange ? Composez la journée.",
  nav: "Créer votre journée",
};

const SV: PlannerCopy = {
  ...EN,
  eyebrow: "Privat dag · från 250 €",
  title: "Skapa din egen Kretaupplevelse",
  lead: "Start, vad ni vill, karta. Körtid och stopp blir priset — minst fem timmar. Ni behöver inte gissa timmarna.",
  seoTitle: "Skapa din egen Kretadag | Privat tur från Rethymno",
  seoDescription:
    "Privat Kretadag från Rethymno: stränder, byar, vin eller historia, rutt på kartan, livepris från 250 €.",
  start: "Var startar ni?",
  people: "Personer",
  date: "Datum",
  interestsHeading: "Vad vill ni uppleva?",
  createDay: "Skapa den här dagen",
  weCreated: "Vi har lagt den här resan för er",
  useThis: "Använd den här dagen",
  changeStops: "Ändra ett stopp",
  yourTrip: "Er resa",
  driving: "Körning",
  stays: "Stopp",
  total: "Totalt",
  billed: "debiteras",
  minNote: "Minst 5 timmar",
  privateTour: "Privat tur",
  bookMyTour: "Boka min tur",
  add: "Lägg till",
  added: "Tillagd",
  remove: "Ta bort",
  suggestedStay: "Föreslagen tid",
  stay: "Stopp",
  addons: "Lägg till på dagen",
  addonHint: "Önskemål till desken. Eventuellt tillägg bekräftar vi.",
  photoshoot: "Professionell fotografering ingår",
  longWarn: "Dagen kan bli i längsta laget. Ta bort ett stopp eller förläng turen.",
  rewrite: "Fixa dagen",
  packagedLead: "Det här är i praktiken vår {title} — oftast billigare som färdig tur.",
  bookPackaged: "Se den färdiga dagen",
  keepCustom: "Fortsätt skräddarsy",
  bookTitle: "Håll den här dagen",
  name: "Namn",
  email: "E-post",
  hotel: "Hotell eller villa",
  phone: "Telefon eller WhatsApp",
  message: "Vad vi bör veta",
  send: "Skicka förfrågan",
  sending: "Skickar…",
  sent: "Förfrågan skickad",
  submitted: "Desken har er dag. Den som kör den svarar inom några timmar.",
  whatsapp: "Skicka i WhatsApp",
  share: "Kopiera länk",
  copied: "Kopierad",
  openMaps: "Öppna i Google Maps",
  emptyTrip: "Lägg till ett stopp från korten, eller kryssa vad ni vill så skriver vi dagen.",
  pickInterests: "Minst ett, eller bygg från kartan.",
  all: "Alla",
  included: "Privat van, engelsktalande förare, upphämtning, fotografering, vatten.",
  fromPrice: "Från",
  guests: "gäster",
  categories: {
    beach: "Stränder",
    villages: "Byar",
    food: "Kretensk mat",
    wine: "Vin",
    history: "Historia",
    hiking: "Vandring",
    hidden: "Gömda platser",
    nature: "Natur",
  },
  addonsLabel: {
    guide: "Licensierad guide",
    lunch: "Lunch i byn",
    wine: "Vinprovning",
    experience: "Extra upplevelse",
  },
  startsHint: "Upphämtning i Rethymnoområdet är standard. Chania och flygplatserna går — körningen är en del av dagen.",
  faqTitle: "Så fungerar en skräddarsydd dag",
  faqs: EN.faqs,
  homeEyebrow: "Nytt",
  homeTitle: "Eller skriv dagen själva",
  homeLead: "En privat Kretadag på en karta: välj en känsla, lägg till Preveli eller Spili, se timmar och pris röra sig.",
  homeCta: "Skapa er dag",
  addToDay: "Lägg till på en egen dag",
  buildDifferent: "En annan mix? Bygg dagen själva.",
  nav: "Skapa er dag",
};

const COPY: Record<Lang, PlannerCopy> = { en: EN, de: DE, it: IT, fr: FR, sv: SV };

export function plannerCopy(lang: Lang): PlannerCopy {
  return COPY[lang] ?? EN;
}
