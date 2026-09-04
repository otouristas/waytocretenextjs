import type { Lang } from "./langs";
import { fill } from "./langs";

export type DeskCopy = {
  pickupOnBooking: string;
  meetInTown: string;
  tourPayment: string;
  transferArea: string;
  transferNotCovered: string;
  transferPayment: string;
  whatsappReply: string;
  weddingReply: string;
  meterLine: string;
  meterReturn: string;
  cancelReply: string;
  payReply: string;
  notIncluded: string;
  bringPrefix: string;
  onTour: string;
  liveDiary: string;
  perkPickup: string;
  perkMeet: string;
  perkGroup: string;
  perkPhoto: string;
  perkCancel: string;
  currentTour: string;
  leadPrice: string;
  leadGroup: string;
  leadFit: string;
  noLiveCalendar: string;
  whatsappHint: string;
  emptyChat: string;
};

const EN: DeskCopy = {
  pickupOnBooking: "Pickup time confirmed on booking",
  meetInTown: "Meet in town — no hotel pickup",
  tourPayment:
    "You request the date here. We confirm availability, then send how to pay. Nothing is charged on this site.",
  transferArea:
    "Rethymno town, nearby villas, and the west-center of the island. Heraklion and Chania airports when the stay is in our area.",
  transferNotCovered:
    "We do not run island-wide taxi apps or south-coast airport shuttles for stays far from Rethymno.",
  transferPayment:
    "You send a request with your flight and hotel; we confirm and send how to pay. Nothing is charged on this site.",
  whatsappReply:
    "Ernest picks up WhatsApp himself — {phone}. Or write here and I will pull the day up for you.",
  weddingReply:
    "Wedding parties we handle as a private job: guest shuttles, the couple's car, and timings that hold even when the ceremony runs late. Send the date and the two addresses and Ernest will price it.",
  meterLine:
    "The meter runs per kilometre — €{min}/km for up to four of you, €{max}/km for a bigger van, €{minimum} minimum",
  meterReturn: ", and the return leg is the same rate",
  cancelReply:
    "Where a day lists it, you cancel free up to 48 hours before pickup and pay nothing. Inside that window, message the desk — Ernest sorts it in person rather than by policy.",
  payReply:
    "Nothing is charged on this site. Days with a live calendar finish on the booking engine; everything else you request here, we confirm the date, then we send how to pay. Never send a card number in this chat.",
  notIncluded: " Not included: {list}.",
  bringPrefix: " Bring {list}.",
  onTour: "On {title}: {included}.",
  liveDiary:
    "{title} has a live diary: {n} {days} in {month}{sample}. Pick one on the calendar and the engine takes it from there.",
  perkPickup: "hotel pickup included",
  perkMeet: "we meet in town",
  perkGroup: "groups of {n} or fewer",
  perkPhoto: "a photographer comes along",
  perkCancel: "free cancellation {n}h before",
  currentTour:
    "{title} — {price}, {duration}, {perks}. Tell me a date and how many of you, and I will put it in front of Ernest.",
  leadPrice: "Here is what those days cost, straight from our own pages:",
  leadGroup: "These run small — here is what fits:",
  leadFit: "A few days that fit what you asked for:",
  noLiveCalendar: "No live calendar. Ask them to request the date on this page or WhatsApp.",
  whatsappHint: "WhatsApp is usually fastest for a same-day reply.",
  emptyChat: "Say what you need the desk to hold.",
};

const DE: DeskCopy = {
  pickupOnBooking: "Abholzeit wird bei der Buchung bestätigt",
  meetInTown: "Treffpunkt in der Stadt — keine Hotelabholung",
  tourPayment:
    "Sie fragen das Datum hier an. Wir bestätigen die Verfügbarkeit und schicken dann, wie Sie zahlen. Auf dieser Seite wird nichts abgebucht.",
  transferArea:
    "Rethymno-Stadt, Villen in der Nähe und die westliche Inselmitte. Flughäfen Heraklion und Chania, wenn der Aufenthalt bei uns ist.",
  transferNotCovered:
    "Wir sind keine Insel-Taxi-App und fahren keine Südcoast-Flughafenshuttles für Aufenthalte weit weg von Rethymno.",
  transferPayment:
    "Sie schicken Flug und Hotel; wir bestätigen und schicken, wie Sie zahlen. Auf dieser Seite wird nichts abgebucht.",
  whatsappReply:
    "Ernest nimmt WhatsApp selbst ab — {phone}. Oder schreiben Sie hier, dann hole ich den Tag für Sie.",
  weddingReply:
    "Hochzeitsgruppen machen wir als privaten Auftrag: Gästeshuttles, das Auto des Paares und Zeiten, die auch halten, wenn die Zeremonie später endet. Schicken Sie Datum und die zwei Adressen, Ernest kalkuliert.",
  meterLine:
    "Der Zähler läuft pro Kilometer — {min} €/km für bis zu vier, {max} €/km für einen größeren Van, {minimum} € Minimum",
  meterReturn: ", und die Rückfahrt zum selben Satz",
  cancelReply:
    "Wo ein Tag es ausweist, stornieren Sie bis 48 Stunden vor der Abholung kostenlos. Innerhalb dieses Fensters schreiben Sie dem Desk — Ernest klärt das persönlich, nicht nach Schema.",
  payReply:
    "Auf dieser Seite wird nichts abgebucht. Tage mit Live-Kalender enden in der Buchungsmaschine; alles andere fragen Sie hier an, wir halten das Datum, dann schicken wir die Zahlung. Schicken Sie in diesem Chat keine Kartennummer.",
  notIncluded: " Nicht enthalten: {list}.",
  bringPrefix: " Mitbringen: {list}.",
  onTour: "Bei {title}: {included}.",
  liveDiary:
    "{title} hat ein Live-Tagebuch: {n} {days} im {month}{sample}. Wählen Sie einen Tag im Kalender, den Rest macht die Maschine.",
  perkPickup: "Hotelabholung inklusive",
  perkMeet: "wir treffen uns in der Stadt",
  perkGroup: "Gruppen von höchstens {n}",
  perkPhoto: "ein Fotograf kommt mit",
  perkCancel: "kostenlose Stornierung {n} Std. vorher",
  currentTour:
    "{title} — {price}, {duration}, {perks}. Nennen Sie mir ein Datum und wie viele Sie sind, dann lege ich es Ernest vor.",
  leadPrice: "Das kosten diese Tage, direkt von unseren eigenen Seiten:",
  leadGroup: "Die bleiben klein — das passt:",
  leadFit: "Ein paar Tage, die zu dem passen, was Sie gefragt haben:",
  noLiveCalendar: "Kein Live-Kalender. Bitte das Datum auf dieser Seite oder per WhatsApp anfragen.",
  whatsappHint: "WhatsApp ist meist am schnellsten für eine Antwort am selben Tag.",
  emptyChat: "Sagen Sie, was der Desk halten soll.",
};

const IT: DeskCopy = {
  pickupOnBooking: "Orario di ritiro confermato in prenotazione",
  meetInTown: "Ci vediamo in città — niente ritiro in hotel",
  tourPayment:
    "Chiedete la data qui. Confermiamo la disponibilità, poi inviamo come pagare. Su questo sito non si addebita nulla.",
  transferArea:
    "Rethymno città, ville vicine e il centro-ovest dell'isola. Aeroporti di Heraklion e La Canea quando il soggiorno è nella nostra zona.",
  transferNotCovered:
    "Non siamo un'app taxi per tutta l'isola e non facciamo navette aeroporto sulla costa sud per soggiorni lontani da Rethymno.",
  transferPayment:
    "Mandate volo e hotel; confermiamo e inviamo come pagare. Su questo sito non si addebita nulla.",
  whatsappReply:
    "Ernest risponde lui stesso su WhatsApp — {phone}. Oppure scrivete qui e recupero la giornata per voi.",
  weddingReply:
    "I matrimoni li gestiamo come lavoro privato: navette ospiti, l'auto della coppia e orari che reggono anche se la cerimonia finisce tardi. Mandate data e i due indirizzi, Ernest fa il prezzo.",
  meterLine:
    "Il tassametro è a chilometro — {min} €/km fino a quattro, {max} €/km per un van più grande, minimo {minimum} €",
  meterReturn: ", e il ritorno allo stesso tariffario",
  cancelReply:
    "Dove il giorno lo indica, cancellate gratis fino a 48 ore prima del ritiro. Dentro quella finestra scrivete al desk — Ernest sistema di persona, non per regolamento.",
  payReply:
    "Su questo sito non si addebita nulla. I giorni con calendario live chiudono sul motore di prenotazione; tutto il resto lo chiedete qui, confermiamo la data, poi inviamo come pagare. Non mandate mai un numero di carta in questa chat.",
  notIncluded: " Non incluso: {list}.",
  bringPrefix: " Portate {list}.",
  onTour: "Su {title}: {included}.",
  liveDiary:
    "{title} ha un diario live: {n} {days} a {month}{sample}. Sceglietene uno sul calendario e il motore fa il resto.",
  perkPickup: "ritiro in hotel incluso",
  perkMeet: "ci vediamo in città",
  perkGroup: "gruppi di {n} o meno",
  perkPhoto: "c'è un fotografo",
  perkCancel: "cancellazione gratuita {n}h prima",
  currentTour:
    "{title} — {price}, {duration}, {perks}. Datemi una data e in quanti siete, e lo metto davanti a Ernest.",
  leadPrice: "Ecco quanto costano quei giorni, dalle nostre pagine:",
  leadGroup: "Restano piccoli — ecco cosa ci sta:",
  leadFit: "Qualche giorno che corrisponde a quello che avete chiesto:",
  noLiveCalendar: "Nessun calendario live. Chiedete la data in questa pagina o su WhatsApp.",
  whatsappHint: "WhatsApp è di solito il più veloce per una risposta in giornata.",
  emptyChat: "Dite cosa deve tenere il desk.",
};

const FR: DeskCopy = {
  pickupOnBooking: "Heure de prise en charge confirmée à la réservation",
  meetInTown: "Rendez-vous en ville — pas de prise en charge à l'hôtel",
  tourPayment:
    "Vous demandez la date ici. Nous confirmons la disponibilité, puis envoyons comment payer. Rien n'est débité sur ce site.",
  transferArea:
    "Réthymnon ville, villas proches, et le centre-ouest de l'île. Aéroports d'Héraklion et de La Canée quand le séjour est chez nous.",
  transferNotCovered:
    "Nous ne sommes pas une appli taxi pour toute l'île et nous ne faisons pas de navettes aéroport sur la côte sud pour des séjours loin de Réthymnon.",
  transferPayment:
    "Vous envoyez vol et hôtel ; nous confirmons et envoyons comment payer. Rien n'est débité sur ce site.",
  whatsappReply:
    "Ernest répond lui-même sur WhatsApp — {phone}. Ou écrivez ici et je sors la journée pour vous.",
  weddingReply:
    "Les mariages, on les traite en mission privée : navettes invités, voiture des mariés, et horaires qui tiennent même si la cérémonie finit tard. Envoyez la date et les deux adresses, Ernest chiffre.",
  meterLine:
    "Le compteur tourne au kilomètre — {min} €/km jusqu'à quatre, {max} €/km pour un plus grand van, minimum {minimum} €",
  meterReturn: ", et le retour au même tarif",
  cancelReply:
    "Là où la journée l'indique, vous annulez gratuitement jusqu'à 48 heures avant la prise en charge. Dans cette fenêtre, écrivez au desk — Ernest règle ça en personne, pas par règlement.",
  payReply:
    "Rien n'est débité sur ce site. Les journées avec calendrier live se terminent sur le moteur de réservation ; le reste, vous le demandez ici, nous tenons la date, puis nous envoyons le paiement. N'envoyez jamais un numéro de carte dans ce chat.",
  notIncluded: " Non inclus : {list}.",
  bringPrefix: " À emporter : {list}.",
  onTour: "Pour {title} : {included}.",
  liveDiary:
    "{title} a un journal live : {n} {days} en {month}{sample}. Choisissez-en un sur le calendrier, le moteur fait le reste.",
  perkPickup: "prise en charge à l'hôtel incluse",
  perkMeet: "on se retrouve en ville",
  perkGroup: "groupes de {n} ou moins",
  perkPhoto: "un photographe vient",
  perkCancel: "annulation gratuite {n}h avant",
  currentTour:
    "{title} — {price}, {duration}, {perks}. Donnez-moi une date et combien vous êtes, je le mets devant Ernest.",
  leadPrice: "Voici ce que coûtent ces journées, depuis nos propres pages :",
  leadGroup: "Ça reste petit — voici ce qui rentre :",
  leadFit: "Quelques journées qui correspondent à ce que vous avez demandé :",
  noLiveCalendar: "Pas de calendrier live. Demandez la date sur cette page ou par WhatsApp.",
  whatsappHint: "WhatsApp est en général le plus rapide pour une réponse le jour même.",
  emptyChat: "Dites ce que le desk doit retenir.",
};

const SV: DeskCopy = {
  pickupOnBooking: "Hämtningstid bekräftas vid bokning",
  meetInTown: "Möts i stan — ingen hotellhämtning",
  tourPayment:
    "Ni frågar efter datumet här. Vi bekräftar tillgänglighet och skickar sedan hur ni betalar. Inget debiteras på den här sidan.",
  transferArea:
    "Rethymno stad, villor i närheten och västra mittendelarna av ön. Flygplatserna Heraklion och Chania när vistelsen är hos oss.",
  transferNotCovered:
    "Vi är ingen ö-taxi-app och kör inga sydkust-flygplatsshuttles för vistelser långt från Rethymno.",
  transferPayment:
    "Ni skickar flyg och hotell; vi bekräftar och skickar hur ni betalar. Inget debiteras på den här sidan.",
  whatsappReply:
    "Ernest svarar själv på WhatsApp — {phone}. Eller skriv här så tar jag fram dagen åt er.",
  weddingReply:
    "Bröllop tar vi som ett privat uppdrag: gästshuttles, parets bil och tider som håller även om ceremonin drar ut. Skicka datum och de två adresserna, Ernest prisar.",
  meterLine:
    "Mätaren går per kilometer — {min} €/km för upp till fyra, {max} €/km för en större van, {minimum} € minimum",
  meterReturn: ", och returen till samma taxa",
  cancelReply:
    "Där en dag anger det avbokar ni gratis upp till 48 timmar före hämtning. Inom det fönstret skriv till desken — Ernest löser det personligen, inte efter schema.",
  payReply:
    "Inget debiteras på den här sidan. Dagar med livekalender avslutas i bokningsmotorn; allt annat frågar ni efter här, vi håller datumet, sedan skickar vi betalningen. Skicka aldrig ett kortnummer i den här chatten.",
  notIncluded: " Ingår inte: {list}.",
  bringPrefix: " Ta med {list}.",
  onTour: "På {title}: {included}.",
  liveDiary:
    "{title} har en livedagbok: {n} {days} i {month}{sample}. Välj en i kalendern, motorn tar det därifrån.",
  perkPickup: "hotellhämtning ingår",
  perkMeet: "vi möts i stan",
  perkGroup: "grupper på högst {n}",
  perkPhoto: "en fotograf följer med",
  perkCancel: "gratis avbokning {n} timmar före",
  currentTour:
    "{title} — {price}, {duration}, {perks}. Ge mig ett datum och hur många ni är, så lägger jag det framför Ernest.",
  leadPrice: "Så här kostar de dagarna, rakt från våra egna sidor:",
  leadGroup: "De hålls små — här är vad som ryms:",
  leadFit: "Några dagar som passar det ni frågade efter:",
  noLiveCalendar: "Ingen livekalender. Be dem fråga efter datumet på den här sidan eller WhatsApp.",
  whatsappHint: "WhatsApp är oftast snabbast för svar samma dag.",
  emptyChat: "Säg vad desken ska hålla.",
};

export const DESK: Record<Lang, DeskCopy> = {
  en: EN,
  de: DE,
  it: IT,
  fr: FR,
  sv: SV,
};

export function deskCopy(lang: Lang) {
  return DESK[lang] ?? EN;
}

export { fill };
