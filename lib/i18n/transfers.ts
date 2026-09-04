import type { Lang } from "./langs";

export type TransferCopy = {
  seoTitle: string;
  seoDesc: string;
  kicker: string;
  title: string;
  lead: string;
  areaTitle: string;
  areaBody: string;
  weDo: string[];
  weDont: string[];
  weddingNote: string;
  formTitle: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  flight: string;
  passengers: string;
  wedding: string;
  checkoutNote: string;
  reviewsTitle: string;
  weddingHeading: string;
  weddingCta: string;
  weddingSeoTitle: string;
  weddingSeoDesc: string;
  weddingKicker: string;
  weddingLead: string;
  weddingWhatTitle: string;
  weddingRoutesTitle: string;
  weddingProcessTitle: string;
  weddingFormTitle: string;
  weddingPriceTitle: string;
  routeSeoTitle: (from: string, to: string) => string;
  routeSeoDesc: (from: string, to: string, km: number, minutes: string) => string;
  routeHeading: (from: string, to: string) => string;
  routeLead: (from: string, to: string, minutes: string) => string;
  routeOther: string;
  routeBackToAll: string;
};

const EN: TransferCopy = {
  seoTitle: "Rethymno Airport Transfers | Chania & Heraklion to Rethymno",
  seoDesc:
    "Private airport transfers between Chania or Heraklion airport and Rethymno, plus hotel transfers across the Rethymno region. Metered per kilometre, flight tracking, free child seats.",
  kicker: "Rethymno region",
  title: "Ask for a transfer. We'll confirm the van.",
  lead: "We cover Rethymno town and the wider Rethymno region, plus airport runs to Chania (CHQ) and Heraklion (HER) — and the same in reverse. We do not run intra-Chania, intra-Heraklion or Lassithi (including Agios Nikolaos).",
  areaTitle: "Where we drive",
  areaBody:
    "If your pin is inside the Rethymno area, or it is an airport shuttle to/from Rethymno, send the request.",
  weDo: [
    "Hotel, villa and port pickups in the Rethymno region",
    "CHQ or HER airport ↔ Rethymno, with your flight tracked",
    "Wedding guest logistics from Rethymno bases",
    "Multi-day driver plans for a stay",
    "Free child and booster seats, up to two per booking",
  ],
  weDont: [
    "Transfers that stay inside Chania, Heraklion or Lassithi",
    "Agios Nikolaos local runs",
  ],
  weddingNote:
    "Wedding groups: send date, venue, hotels and guest count. We reply with a transport plan.",
  formTitle: "Transfer request",
  pickup: "Pickup",
  dropoff: "Drop-off",
  date: "Date",
  time: "Time",
  flight: "Flight number (if airport)",
  passengers: "Passengers",
  wedding: "This is for a wedding or event",
  checkoutNote:
    "No payment is taken here. We confirm the vehicle and the fare, then send you a payment link.",
  reviewsTitle: "What transfer guests wrote",
  weddingHeading: "Getting every guest to the venue, on time",
  weddingCta: "Wedding transfers",
  weddingSeoTitle: "Wedding Transfers in Crete | Guest Transport from Rethymno",
  weddingSeoDesc:
    "Wedding guest transport in the Rethymno region of Crete: airport arrivals from Chania and Heraklion, hotel-to-venue runs and staggered departures, planned with your wedding planner.",
  weddingKicker: "For couples and planners",
  weddingLead:
    "Guests arrive on different flights, sleep in different hotels and leave at different hours. We plan the whole movement in advance so nobody on the wedding day is coordinating a minibus.",
  weddingWhatTitle: "What we cover",
  weddingRoutesTitle: "The journeys a Crete wedding usually needs",
  weddingProcessTitle: "How it gets planned",
  weddingFormTitle: "Tell us about the wedding",
  weddingPriceTitle: "What it costs",
  routeSeoTitle: (from, to) => `${from} to ${to} Transfer | Private Taxi, Crete`,
  routeSeoDesc: (from, to, km, minutes) =>
    `Private transfer from ${from} to ${to}: ${km} km, about ${minutes}. Metered per kilometre, flight tracked, free child seats, up to eight passengers.`,
  routeHeading: (from, to) => `${from} to ${to}`,
  routeLead: (from, to, minutes) =>
    `A private, pre-booked drive from ${from} to ${to} — about ${minutes} door to door, in an air-conditioned van with your driver waiting when you land.`,
  routeOther: "Other routes we drive",
  routeBackToAll: "All transfers",
};

const DE: TransferCopy = {
  seoTitle: "Flughafentransfers Rethymno | Chania & Heraklion nach Rethymno",
  seoDesc:
    "Private Flughafentransfers zwischen Chania oder Heraklion und Rethymno sowie Hoteltransfers in der Region. Nach Kilometer, Flugverfolgung, Kindersitze kostenlos.",
  kicker: "Region Rethymno",
  title: "Transfer anfragen. Wir bestätigen den Van.",
  lead: "Wir fahren Rethymno-Stadt und die weitere Region, plus Flughafenfahrten nach Chania (CHQ) und Heraklion (HER) — und denselben Weg zurück. Wir fahren nicht innerhalb von Chania, Heraklion oder Lassithi (einschließlich Agios Nikolaos).",
  areaTitle: "Wohin wir fahren",
  areaBody:
    "Liegt Ihre Adresse in der Region Rethymno, oder ist es ein Flughafenshuttle von/nach Rethymno, schicken Sie die Anfrage.",
  weDo: [
    "Hotel-, Villa- und Hafenabholung in der Region Rethymno",
    "Flughafen CHQ oder HER ↔ Rethymno, mit Flugverfolgung",
    "Logistik für Hochzeitsgäste ab Rethymno",
    "Mehrtägige Fahrerpläne für einen Aufenthalt",
    "Kostenlose Kinder- und Sitzerhöhungen, bis zu zwei pro Buchung",
  ],
  weDont: [
    "Transfers, die in Chania, Heraklion oder Lassithi bleiben",
    "Lokale Fahrten in Agios Nikolaos",
  ],
  weddingNote:
    "Hochzeitsgruppen: Datum, Location, Hotels und Gästezahl schicken. Wir antworten mit einem Fahrplan.",
  formTitle: "Transferanfrage",
  pickup: "Abholung",
  dropoff: "Ziel",
  date: "Datum",
  time: "Uhrzeit",
  flight: "Flugnummer (bei Flughafen)",
  passengers: "Fahrgäste",
  wedding: "Das ist für eine Hochzeit oder Veranstaltung",
  checkoutNote:
    "Hier wird nichts abgebucht. Wir bestätigen Fahrzeug und Preis und schicken dann einen Zahlungslink.",
  reviewsTitle: "Was Transfergäste geschrieben haben",
  weddingHeading: "Jeden Gast pünktlich zur Location",
  weddingCta: "Hochzeitstransfers",
  weddingSeoTitle: "Hochzeitstransfers auf Kreta | Gästetransport ab Rethymno",
  weddingSeoDesc:
    "Gästetransport für Hochzeiten in der Region Rethymno: Ankünfte aus Chania und Heraklion, Hotel-Location-Fahrten und gestaffelte Abfahrten, geplant mit Ihrem Wedding Planner.",
  weddingKicker: "Für Paare und Planer",
  weddingLead:
    "Gäste kommen auf verschiedenen Flügen, schlafen in verschiedenen Hotels und fahren zu verschiedenen Zeiten. Wir planen die ganze Bewegung im Voraus, damit am Hochzeitstag niemand einen Minibus koordiniert.",
  weddingWhatTitle: "Was wir abdecken",
  weddingRoutesTitle: "Die Fahrten, die eine Kreta-Hochzeit meist braucht",
  weddingProcessTitle: "So wird geplant",
  weddingFormTitle: "Erzählen Sie uns von der Hochzeit",
  weddingPriceTitle: "Was es kostet",
  routeSeoTitle: (from, to) => `Transfer ${from} nach ${to} | Privates Taxi, Kreta`,
  routeSeoDesc: (from, to, km, minutes) =>
    `Privater Transfer von ${from} nach ${to}: ${km} km, etwa ${minutes}. Nach Kilometer, Flugverfolgung, Kindersitze kostenlos, bis acht Fahrgäste.`,
  routeHeading: (from, to) => `${from} nach ${to}`,
  routeLead: (from, to, minutes) =>
    `Eine private, vorgebuchte Fahrt von ${from} nach ${to} — etwa ${minutes} Tür zu Tür, im klimatisierten Van, der Fahrer wartet bei der Landung.`,
  routeOther: "Andere Strecken, die wir fahren",
  routeBackToAll: "Alle Transfers",
};

const IT: TransferCopy = {
  seoTitle: "Transfer aeroportuali Rethymno | La Canea e Heraklion",
  seoDesc:
    "Transfer aeroportuali privati tra La Canea o Heraklion e Rethymno, più transfer hotel in zona. A chilometro, tracciamento del volo, seggiolini gratis.",
  kicker: "Regione di Rethymno",
  title: "Chiedete un transfer. Confermiamo il van.",
  lead: "Copriamo Rethymno città e la regione, più le corse aeroportuali per La Canea (CHQ) e Heraklion (HER) — e il contrario. Non facciamo corse interne a La Canea, Heraklion o Lassithi (Agios Nikolaos compreso).",
  areaTitle: "Dove guidiamo",
  areaBody:
    "Se il pin è nella zona di Rethymno, o è una navetta aeroporto da/per Rethymno, inviate la richiesta.",
  weDo: [
    "Ritiri in hotel, villa e porto nella regione di Rethymno",
    "Aeroporto CHQ o HER ↔ Rethymno, con volo tracciato",
    "Logistica ospiti matrimonio da basi a Rethymno",
    "Piani autista di più giorni per un soggiorno",
    "Seggiolini e rialzi gratis, fino a due per prenotazione",
  ],
  weDont: [
    "Transfer che restano dentro La Canea, Heraklion o Lassithi",
    "Corse locali ad Agios Nikolaos",
  ],
  weddingNote:
    "Gruppi matrimonio: mandate data, location, hotel e numero ospiti. Rispondiamo con un piano trasporti.",
  formTitle: "Richiesta transfer",
  pickup: "Ritiro",
  dropoff: "Destinazione",
  date: "Data",
  time: "Ora",
  flight: "Numero di volo (se aeroporto)",
  passengers: "Passeggeri",
  wedding: "È per un matrimonio o un evento",
  checkoutNote:
    "Qui non si paga. Confermiamo il veicolo e la tariffa, poi inviamo un link di pagamento.",
  reviewsTitle: "Cosa hanno scritto gli ospiti dei transfer",
  weddingHeading: "Ogni ospite in location, in orario",
  weddingCta: "Transfer per matrimoni",
  weddingSeoTitle: "Transfer matrimonio a Creta | Trasporto ospiti da Rethymno",
  weddingSeoDesc:
    "Trasporto ospiti matrimonio nella regione di Rethymno: arrivi da La Canea e Heraklion, corse hotel-location e partenze scaglionate, pianificate con il wedding planner.",
  weddingKicker: "Per coppie e planner",
  weddingLead:
    "Gli ospiti arrivano su voli diversi, dormono in hotel diversi e partono a orari diversi. Pianifichiamo tutto il movimento in anticipo, così il giorno del matrimonio nessuno coordina un minibus.",
  weddingWhatTitle: "Cosa copriamo",
  weddingRoutesTitle: "I tragitti che un matrimonio a Creta di solito serve",
  weddingProcessTitle: "Come si pianifica",
  weddingFormTitle: "Parlateci del matrimonio",
  weddingPriceTitle: "Quanto costa",
  routeSeoTitle: (from, to) => `Transfer ${from} – ${to} | Taxi privato, Creta`,
  routeSeoDesc: (from, to, km, minutes) =>
    `Transfer privato da ${from} a ${to}: ${km} km, circa ${minutes}. A chilometro, volo tracciato, seggiolini gratis, fino a otto passeggeri.`,
  routeHeading: (from, to) => `${from} a ${to}`,
  routeLead: (from, to, minutes) =>
    `Un tragitto privato prenotato da ${from} a ${to} — circa ${minutes} porta a porta, in un van climatizzato con l'autista ad aspettarvi all'arrivo.`,
  routeOther: "Altri percorsi che facciamo",
  routeBackToAll: "Tutti i transfer",
};

const FR: TransferCopy = {
  seoTitle: "Transferts aéroport Réthymnon | La Canée et Héraklion",
  seoDesc:
    "Transferts aéroport privés entre La Canée ou Héraklion et Réthymnon, plus transferts hôtels dans la région. Au kilomètre, suivi de vol, sièges enfant offerts.",
  kicker: "Région de Réthymnon",
  title: "Demandez un transfert. Nous confirmons le van.",
  lead: "Nous couvrons Réthymnon ville et la région, plus les navettes aéroport vers La Canée (CHQ) et Héraklion (HER) — et le chemin inverse. Nous ne faisons pas de courses intra-Canée, intra-Héraklion ni Lassithi (Agios Nikolaos compris).",
  areaTitle: "Où nous roulons",
  areaBody:
    "Si votre épingle est dans la zone de Réthymnon, ou s'il s'agit d'une navette aéroport vers/depuis Réthymnon, envoyez la demande.",
  weDo: [
    "Prises en charge hôtel, villa et port dans la région de Réthymnon",
    "Aéroport CHQ ou HER ↔ Réthymnon, avec suivi de vol",
    "Logistique des invités de mariage depuis Réthymnon",
    "Plans chauffeur sur plusieurs jours pour un séjour",
    "Sièges enfant et rehausseurs offerts, jusqu'à deux par réservation",
  ],
  weDont: [
    "Transferts qui restent dans La Canée, Héraklion ou Lassithi",
    "Courses locales à Agios Nikolaos",
  ],
  weddingNote:
    "Groupes mariage : envoyez date, lieu, hôtels et nombre d'invités. Nous répondons avec un plan de transport.",
  formTitle: "Demande de transfert",
  pickup: "Prise en charge",
  dropoff: "Destination",
  date: "Date",
  time: "Heure",
  flight: "Numéro de vol (si aéroport)",
  passengers: "Passagers",
  wedding: "C'est pour un mariage ou un événement",
  checkoutNote:
    "Aucun paiement ici. Nous confirmons le véhicule et le tarif, puis envoyons un lien de paiement.",
  reviewsTitle: "Ce qu'ont écrit les voyageurs en transfert",
  weddingHeading: "Chaque invité au lieu, à l'heure",
  weddingCta: "Transferts de mariage",
  weddingSeoTitle: "Transferts de mariage en Crète | Transport d'invités depuis Réthymnon",
  weddingSeoDesc:
    "Transport d'invités de mariage dans la région de Réthymnon : arrivées La Canée et Héraklion, trajets hôtel–lieu et départs échelonnés, planifiés avec votre wedding planner.",
  weddingKicker: "Pour les couples et les planners",
  weddingLead:
    "Les invités arrivent sur des vols différents, dorment dans des hôtels différents et partent à des heures différentes. Nous planifions tout le mouvement à l'avance pour que personne ne coordonne un minibus le jour J.",
  weddingWhatTitle: "Ce que nous couvrons",
  weddingRoutesTitle: "Les trajets dont un mariage en Crète a généralement besoin",
  weddingProcessTitle: "Comment ça se planifie",
  weddingFormTitle: "Parlez-nous du mariage",
  weddingPriceTitle: "Ce que ça coûte",
  routeSeoTitle: (from, to) => `Transfert ${from} – ${to} | Taxi privé, Crète`,
  routeSeoDesc: (from, to, km, minutes) =>
    `Transfert privé de ${from} à ${to} : ${km} km, environ ${minutes}. Au kilomètre, vol suivi, sièges enfant offerts, jusqu'à huit passagers.`,
  routeHeading: (from, to) => `${from} à ${to}`,
  routeLead: (from, to, minutes) =>
    `Un trajet privé réservé de ${from} à ${to} — environ ${minutes} porte à porte, en van climatisé, le chauffeur vous attend à l'arrivée.`,
  routeOther: "Autres trajets que nous faisons",
  routeBackToAll: "Tous les transferts",
};

const SV: TransferCopy = {
  seoTitle: "Flygplatstransfer Rethymno | Chania och Heraklion",
  seoDesc:
    "Privat flygplatstransfer mellan Chania eller Heraklion och Rethymno, plus hotelltransfer i regionen. Per kilometer, flygspårning, barnstolar gratis.",
  kicker: "Rethymnoregionen",
  title: "Be om transfer. Vi bekräftar vanen.",
  lead: "Vi täcker Rethymno stad och regionen, plus flygplatskörningar till Chania (CHQ) och Heraklion (HER) — och samma väg tillbaka. Vi kör inte inom Chania, Heraklion eller Lassithi (inklusive Agios Nikolaos).",
  areaTitle: "Vart vi kör",
  areaBody:
    "Om er nål ligger i Rethymnoområdet, eller det är en flygplatsshuttle till/från Rethymno, skicka förfrågan.",
  weDo: [
    "Hämtning på hotell, villa och hamn i Rethymnoregionen",
    "Flygplats CHQ eller HER ↔ Rethymno, med flyget spårat",
    "Logistik för bröllopsgäster från baser i Rethymno",
    "Flerdagars chaufförsplaner för en vistelse",
    "Gratis barnstol och bälteskudde, upp till två per bokning",
  ],
  weDont: [
    "Transfer som stannar inne i Chania, Heraklion eller Lassithi",
    "Lokala körningar i Agios Nikolaos",
  ],
  weddingNote:
    "Bröllopsgrupper: skicka datum, venue, hotell och antal gäster. Vi svarar med en transportplan.",
  formTitle: "Transferförfrågan",
  pickup: "Hämtning",
  dropoff: "Avlämning",
  date: "Datum",
  time: "Tid",
  flight: "Flightnummer (om flygplats)",
  passengers: "Passagerare",
  wedding: "Det här är för ett bröllop eller evenemang",
  checkoutNote:
    "Ingen betalning tas här. Vi bekräftar fordon och pris, sedan skickar vi en betalningslänk.",
  reviewsTitle: "Vad transfergäster skrev",
  weddingHeading: "Varje gäst till venue, i tid",
  weddingCta: "Bröllopstransfer",
  weddingSeoTitle: "Bröllopstransfer på Kreta | Gästtransport från Rethymno",
  weddingSeoDesc:
    "Gästtransport till bröllop i Rethymnoregionen: ankomster från Chania och Heraklion, hotell–venue-körningar och förskjutna avgångar, planerade med er wedding planner.",
  weddingKicker: "För par och planners",
  weddingLead:
    "Gäster kommer på olika flyg, sover på olika hotell och åker vid olika tider. Vi planerar hela rörelsen i förväg så att ingen koordinerar en minibuss på bröllopsdagen.",
  weddingWhatTitle: "Vad vi täcker",
  weddingRoutesTitle: "Resorna ett kretensiskt bröllop oftast behöver",
  weddingProcessTitle: "Så planeras det",
  weddingFormTitle: "Berätta om bröllopet",
  weddingPriceTitle: "Vad det kostar",
  routeSeoTitle: (from, to) => `Transfer ${from} till ${to} | Privat taxi, Kreta`,
  routeSeoDesc: (from, to, km, minutes) =>
    `Privat transfer från ${from} till ${to}: ${km} km, cirka ${minutes}. Per kilometer, flyget spårat, barnstolar gratis, upp till åtta passagerare.`,
  routeHeading: (from, to) => `${from} till ${to}`,
  routeLead: (from, to, minutes) =>
    `En privat, förbokad körning från ${from} till ${to} — cirka ${minutes} dörr till dörr, i en luftkonditionerad van där chauffören väntar när ni landar.`,
  routeOther: "Andra sträckor vi kör",
  routeBackToAll: "Alla transfer",
};

export const TRANSFERS: Record<Lang, TransferCopy> = {
  en: EN,
  de: DE,
  it: IT,
  fr: FR,
  sv: SV,
};

export function transfersCopy(lang: Lang) {
  return TRANSFERS[lang] ?? EN;
}
