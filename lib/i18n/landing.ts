import type { Lang } from "./langs";

/**
 * The two Rethymno landing pages.
 *
 * Both are curation, not new claims: every fact they state is already
 * published on a tour, place or guide page, and their job is to gather that
 * material under the search a visitor actually types. That is why they carry
 * copy of their own but no new figures — a landing page that invents a detail
 * is a landing page that contradicts the product page it links to.
 *
 * Section-scoped like photography and transfers, for the same reason: `UI` is
 * already three hundred fields wide across five locales.
 */

export type LandingCopy = {
  /* /private-tours-from-rethymno */
  privateSeoTitle: string;
  privateSeoDesc: string;
  privateKicker: string;
  privateTitle: string;
  privateLead: string;
  privateWhatTitle: string;
  privateWhat: { title: string; text: string }[];
  privateListTitle: string;
  privateBuildTitle: string;
  privateBuildLead: string;
  privateBuildCta: string;

  /* /things-to-do-in-rethymno */
  thingsSeoTitle: string;
  thingsSeoDesc: string;
  thingsKicker: string;
  thingsTitle: string;
  thingsLead: string;
  thingsTownTitle: string;
  thingsTownLead: string;
  thingsReadTitle: string;
  thingsDayTitle: string;
  thingsDayLead: string;
  thingsGettingTitle: string;
  thingsGettingLead: string;
  thingsGettingCta: string;
};

const EN: LandingCopy = {
  privateSeoTitle: "Private Tours from Rethymno | Your Own Van, Guide and Pace",
  privateSeoDesc:
    "Private day tours from Rethymno with your own driver and vehicle: gorges, villages, beaches and food. Hotel pickup, small groups, free cancellation.",
  privateKicker: "Private departures",
  privateTitle: "Private Tours from Rethymno",
  privateLead:
    "Most of what we run is private by default. You get the vehicle, the driver and the day — nobody else is picked up, nothing is timed to a coach, and the plan bends to how the morning is actually going.",
  privateWhatTitle: "What private means here",
  privateWhat: [
    {
      title: "Your van, not a shared seat",
      text: "One booking takes the whole vehicle. There is no second pickup and no waiting for a group you never met.",
    },
    {
      title: "Hotel pickup across the region",
      text: "We collect you where you are staying in the Rethymno area, at a time confirmed the evening before.",
    },
    {
      title: "The day bends",
      text: "Stay longer where it is good, skip what is not. The route is a plan, not a timetable someone else set.",
    },
    {
      title: "Free cancellation",
      text: "Up to 48 hours before pickup on every priced day, and we try to move the date before we ever charge.",
    },
  ],
  privateListTitle: "Private days from Rethymno",
  privateBuildTitle: "Or build the day yourself",
  privateBuildLead:
    "If none of these is quite the day you want, the planner prices a route you assemble stop by stop, billed by the hour.",
  privateBuildCta: "Build your own day",

  thingsSeoTitle: "Things to Do in Rethymno | Old Town, Beaches and Day Trips",
  thingsSeoDesc:
    "What to actually do in Rethymno: the Venetian old town, the beaches within reach, where to eat, and the day trips worth the drive from here.",
  thingsKicker: "Rethymno",
  thingsTitle: "Things to Do in Rethymno",
  thingsLead:
    "Rethymno is the third city of Crete and the easiest to spend time in — a Venetian and Ottoman old town you can walk in an afternoon, a long beach on its doorstep, and the mountains and south coast within an hour's drive. This is what is worth your time, and what is worth leaving town for.",
  thingsTownTitle: "The town itself",
  thingsTownLead:
    "The old town is the reason to stay rather than pass through: Venetian doorways, a Turkish minaret, the Fortezza above it and a harbour that has not been rebuilt into something else.",
  thingsReadTitle: "Read before you go",
  thingsDayTitle: "Worth leaving town for",
  thingsDayLead:
    "Everything below leaves from Rethymno and returns the same day. The gorges and the south coast are the drives people remember.",
  thingsGettingTitle: "Getting here and getting around",
  thingsGettingLead:
    "Rethymno has no airport of its own. Chania is about 65 minutes away and Heraklion about 70, and both runs are ones we drive daily.",
  thingsGettingCta: "Airport transfers",
};

const DE: LandingCopy = {
  privateSeoTitle: "Private Touren ab Rethymno | Eigener Van, Fahrer und Tempo",
  privateSeoDesc:
    "Private Tagestouren ab Rethymno mit eigenem Fahrer und Fahrzeug: Schluchten, Dörfer, Strände und Essen. Hotelabholung, kleine Gruppen, kostenlose Stornierung.",
  privateKicker: "Private Abfahrten",
  privateTitle: "Private Touren ab Rethymno",
  privateLead:
    "Das meiste, was wir fahren, ist von Haus aus privat. Sie bekommen das Fahrzeug, den Fahrer und den Tag — niemand sonst wird abgeholt, nichts richtet sich nach einem Reisebus, und der Plan passt sich dem Morgen an.",
  privateWhatTitle: "Was privat hier bedeutet",
  privateWhat: [
    {
      title: "Ihr Van, kein geteilter Sitz",
      text: "Eine Buchung nimmt das ganze Fahrzeug. Keine zweite Abholung, kein Warten auf eine fremde Gruppe.",
    },
    {
      title: "Hotelabholung in der Region",
      text: "Wir holen Sie dort ab, wo Sie im Raum Rethymno wohnen, zu einer am Vorabend bestätigten Zeit.",
    },
    {
      title: "Der Tag ist beweglich",
      text: "Bleiben Sie länger, wo es schön ist, lassen Sie aus, was nicht passt. Die Route ist ein Plan, kein fremder Fahrplan.",
    },
    {
      title: "Kostenlose Stornierung",
      text: "Bis 48 Stunden vor der Abholung bei jedem Tag mit Preis — und wir verschieben lieber, als zu berechnen.",
    },
  ],
  privateListTitle: "Private Tage ab Rethymno",
  privateBuildTitle: "Oder bauen Sie den Tag selbst",
  privateBuildLead:
    "Wenn nichts davon genau Ihr Tag ist: Der Planer berechnet eine Route, die Sie Stopp für Stopp zusammenstellen, nach Stunden abgerechnet.",
  privateBuildCta: "Eigenen Tag bauen",

  thingsSeoTitle: "Was tun in Rethymno | Altstadt, Strände und Tagesausflüge",
  thingsSeoDesc:
    "Was man in Rethymno wirklich unternimmt: die venezianische Altstadt, die Strände in Reichweite, wo man isst, und die Tagesausflüge, die die Fahrt lohnen.",
  thingsKicker: "Rethymno",
  thingsTitle: "Was man in Rethymno unternehmen kann",
  thingsLead:
    "Rethymno ist die drittgrößte Stadt Kretas und die angenehmste zum Bleiben — eine venezianisch-osmanische Altstadt, die man an einem Nachmittag durchläuft, ein langer Strand direkt davor und Berge und Südküste in einer Autostunde. Das lohnt Ihre Zeit, und dafür lohnt es sich, die Stadt zu verlassen.",
  thingsTownTitle: "Die Stadt selbst",
  thingsTownLead:
    "Die Altstadt ist der Grund zu bleiben statt durchzufahren: venezianische Portale, ein türkisches Minarett, die Fortezza darüber und ein Hafen, der nicht zu etwas anderem umgebaut wurde.",
  thingsReadTitle: "Vorher lesen",
  thingsDayTitle: "Dafür lohnt es sich rauszufahren",
  thingsDayLead:
    "Alles unten startet in Rethymno und kommt am selben Tag zurück. Die Schluchten und die Südküste sind die Fahrten, an die man sich erinnert.",
  thingsGettingTitle: "Anreise und unterwegs",
  thingsGettingLead:
    "Rethymno hat keinen eigenen Flughafen. Chania liegt etwa 65 Minuten entfernt, Heraklion etwa 70 — beide Strecken fahren wir täglich.",
  thingsGettingCta: "Flughafentransfers",
};

const IT: LandingCopy = {
  privateSeoTitle: "Tour privati da Rethymno | Il vostro van, autista e ritmo",
  privateSeoDesc:
    "Tour privati di un giorno da Rethymno con autista e veicolo dedicati: gole, villaggi, spiagge e cibo. Ritiro in hotel, piccoli gruppi, cancellazione gratuita.",
  privateKicker: "Partenze private",
  privateTitle: "Tour privati da Rethymno",
  privateLead:
    "Quasi tutto ciò che facciamo è privato per impostazione. Avete il veicolo, l'autista e la giornata: nessun altro viene caricato, niente segue l'orario di un pullman, e il piano si adatta a come sta andando la mattina.",
  privateWhatTitle: "Cosa significa privato qui",
  privateWhat: [
    {
      title: "Il vostro van, non un posto condiviso",
      text: "Una prenotazione prende tutto il veicolo. Nessun secondo ritiro, nessuna attesa per un gruppo sconosciuto.",
    },
    {
      title: "Ritiro in hotel nella regione",
      text: "Vi prendiamo dove alloggiate nella zona di Rethymno, a un orario confermato la sera prima.",
    },
    {
      title: "La giornata si adatta",
      text: "Restate più a lungo dove è bello, saltate ciò che non lo è. Il percorso è un piano, non un orario altrui.",
    },
    {
      title: "Cancellazione gratuita",
      text: "Fino a 48 ore prima del ritiro su ogni giornata con prezzo, e proviamo a spostare la data prima di addebitare.",
    },
  ],
  privateListTitle: "Giornate private da Rethymno",
  privateBuildTitle: "Oppure costruite voi la giornata",
  privateBuildLead:
    "Se nessuna è esattamente la giornata che volete, il planner calcola un percorso che componete tappa per tappa, con tariffa oraria.",
  privateBuildCta: "Costruisci la tua giornata",

  thingsSeoTitle: "Cosa fare a Rethymno | Centro storico, spiagge e gite",
  thingsSeoDesc:
    "Cosa fare davvero a Rethymno: il centro storico veneziano, le spiagge raggiungibili, dove mangiare e le gite in giornata che valgono il viaggio.",
  thingsKicker: "Rethymno",
  thingsTitle: "Cosa fare a Rethymno",
  thingsLead:
    "Rethymno è la terza città di Creta e la più piacevole in cui fermarsi: un centro storico veneziano e ottomano che si percorre in un pomeriggio, una lunga spiaggia davanti e montagne e costa sud a un'ora di auto. Questo merita il vostro tempo, e per questo vale la pena uscire dalla città.",
  thingsTownTitle: "La città stessa",
  thingsTownLead:
    "Il centro storico è il motivo per fermarsi invece di passare: portali veneziani, un minareto turco, la Fortezza sopra e un porto che non è stato trasformato in altro.",
  thingsReadTitle: "Da leggere prima",
  thingsDayTitle: "Per cosa vale uscire dalla città",
  thingsDayLead:
    "Tutto qui sotto parte da Rethymno e rientra in giornata. Le gole e la costa sud sono i viaggi che si ricordano.",
  thingsGettingTitle: "Come arrivare e muoversi",
  thingsGettingLead:
    "Rethymno non ha un aeroporto proprio. Chania dista circa 65 minuti e Heraklion circa 70, e sono tratte che percorriamo ogni giorno.",
  thingsGettingCta: "Transfer aeroportuali",
};

const FR: LandingCopy = {
  privateSeoTitle: "Excursions privées depuis Réthymnon | Votre van et chauffeur",
  privateSeoDesc:
    "Journées privées depuis Réthymnon avec chauffeur et véhicule dédiés : gorges, villages, plages et gastronomie. Prise en charge à l'hôtel, annulation gratuite.",
  privateKicker: "Départs privés",
  privateTitle: "Excursions privées depuis Réthymnon",
  privateLead:
    "L'essentiel de ce que nous faisons est privé par défaut. Vous avez le véhicule, le chauffeur et la journée : personne d'autre n'est pris en charge, rien ne suit l'horaire d'un autocar, et le plan s'adapte à la matinée.",
  privateWhatTitle: "Ce que privé veut dire ici",
  privateWhat: [
    {
      title: "Votre van, pas un siège partagé",
      text: "Une réservation prend tout le véhicule. Pas de deuxième prise en charge, pas d'attente d'un groupe inconnu.",
    },
    {
      title: "Prise en charge à l'hôtel",
      text: "Nous venons vous chercher où vous logez dans la région de Réthymnon, à une heure confirmée la veille.",
    },
    {
      title: "La journée s'adapte",
      text: "Restez plus longtemps où c'est beau, sautez ce qui ne l'est pas. L'itinéraire est un plan, pas un horaire imposé.",
    },
    {
      title: "Annulation gratuite",
      text: "Jusqu'à 48 heures avant la prise en charge sur chaque journée avec prix, et nous déplaçons plutôt que de facturer.",
    },
  ],
  privateListTitle: "Journées privées depuis Réthymnon",
  privateBuildTitle: "Ou composez la journée vous-même",
  privateBuildLead:
    "Si aucune n'est tout à fait votre journée, le planificateur chiffre un itinéraire que vous assemblez étape par étape, facturé à l'heure.",
  privateBuildCta: "Composer ma journée",

  thingsSeoTitle: "Que faire à Réthymnon | Vieille ville, plages et excursions",
  thingsSeoDesc:
    "Que faire vraiment à Réthymnon : la vieille ville vénitienne, les plages à portée, où manger, et les excursions à la journée qui valent la route.",
  thingsKicker: "Réthymnon",
  thingsTitle: "Que faire à Réthymnon",
  thingsLead:
    "Réthymnon est la troisième ville de Crète et la plus agréable où s'installer : une vieille ville vénitienne et ottomane qui se parcourt en un après-midi, une longue plage juste devant, et les montagnes et la côte sud à une heure de route. Voici ce qui mérite votre temps, et ce pour quoi il vaut la peine de sortir de la ville.",
  thingsTownTitle: "La ville elle-même",
  thingsTownLead:
    "La vieille ville est la raison de rester plutôt que de passer : portails vénitiens, un minaret turc, la Fortezza au-dessus et un port qui n'a pas été transformé en autre chose.",
  thingsReadTitle: "À lire avant",
  thingsDayTitle: "Ce pour quoi il vaut la peine de sortir",
  thingsDayLead:
    "Tout ci-dessous part de Réthymnon et rentre le jour même. Les gorges et la côte sud sont les routes dont on se souvient.",
  thingsGettingTitle: "Arriver et circuler",
  thingsGettingLead:
    "Réthymnon n'a pas d'aéroport. La Canée est à environ 65 minutes et Héraklion à environ 70, et nous faisons ces trajets tous les jours.",
  thingsGettingCta: "Transferts aéroport",
};

const SV: LandingCopy = {
  privateSeoTitle: "Privata turer från Rethymno | Egen van, förare och tempo",
  privateSeoDesc:
    "Privata dagsturer från Rethymno med egen förare och bil: raviner, byar, stränder och mat. Hämtning vid hotellet, små grupper, fri avbokning.",
  privateKicker: "Privata avgångar",
  privateTitle: "Privata turer från Rethymno",
  privateLead:
    "Det mesta vi kör är privat som standard. Ni får bilen, föraren och dagen — ingen annan hämtas, ingenting följer en bussturlista, och planen anpassas efter hur morgonen faktiskt blir.",
  privateWhatTitle: "Vad privat betyder här",
  privateWhat: [
    {
      title: "Er van, inte en delad plats",
      text: "En bokning tar hela bilen. Ingen andra hämtning, ingen väntan på en grupp ni aldrig träffat.",
    },
    {
      title: "Hämtning vid hotellet i regionen",
      text: "Vi hämtar er där ni bor i Rethymnoområdet, vid en tid vi bekräftar kvällen innan.",
    },
    {
      title: "Dagen är rörlig",
      text: "Stanna längre där det är fint, hoppa över det som inte är det. Rutten är en plan, inte någon annans tidtabell.",
    },
    {
      title: "Fri avbokning",
      text: "Upp till 48 timmar före hämtning på varje dag med pris, och vi flyttar hellre datumet än debiterar.",
    },
  ],
  privateListTitle: "Privata dagar från Rethymno",
  privateBuildTitle: "Eller bygg dagen själv",
  privateBuildLead:
    "Om ingen av dem är riktigt er dag prissätter planeraren en rutt ni sätter ihop stopp för stopp, debiterad per timme.",
  privateBuildCta: "Bygg er egen dag",

  thingsSeoTitle: "Att göra i Rethymno | Gamla stan, stränder och utflykter",
  thingsSeoDesc:
    "Vad man faktiskt gör i Rethymno: den venetianska gamla staden, stränderna inom räckhåll, var man äter, och dagsutflykterna som är värda resan.",
  thingsKicker: "Rethymno",
  thingsTitle: "Att göra i Rethymno",
  thingsLead:
    "Rethymno är Kretas tredje stad och den trevligaste att stanna i — en venetiansk och osmansk gammal stad man går igenom på en eftermiddag, en lång strand precis utanför, och bergen och sydkusten inom en timmes bilfärd. Det här är värt er tid, och det här är värt att lämna staden för.",
  thingsTownTitle: "Staden själv",
  thingsTownLead:
    "Gamla staden är skälet att stanna i stället för att passera: venetianska portaler, en turkisk minaret, Fortezza ovanför och en hamn som inte byggts om till något annat.",
  thingsReadTitle: "Läs innan ni åker",
  thingsDayTitle: "Värt att lämna staden för",
  thingsDayLead:
    "Allt nedan utgår från Rethymno och är tillbaka samma dag. Ravinerna och sydkusten är de resor man minns.",
  thingsGettingTitle: "Hit och runt",
  thingsGettingLead:
    "Rethymno har ingen egen flygplats. Chania ligger cirka 65 minuter bort och Heraklion cirka 70, och båda sträckorna kör vi dagligen.",
  thingsGettingCta: "Flygplatstransfer",
};

const COPY: Record<Lang, LandingCopy> = { en: EN, de: DE, it: IT, fr: FR, sv: SV };

export function landingCopy(lang: Lang): LandingCopy {
  return COPY[lang] ?? EN;
}
