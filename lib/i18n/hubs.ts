import type { Lang } from "./langs";
import type { HubId } from "@/lib/nav/hubs";

export type HubCopy = {
  label: string;
  short: string;
  seoTitle: string;
  seoDesc: string;
  lead: string;
};

const EN: Record<HubId, HubCopy> = {
  "outdoor-activities-nature-tours-crete": {
    label: "Outdoor Activities & Nature Tours in Crete",
    short: "Outdoor & Nature",
    seoTitle: "Outdoor Activities & Nature Tours in Crete | From Rethymno",
    seoDesc:
      "Private nature days from Rethymno: Lake Kournas, village roads, the south coast and Elafonisi pink sand. Small groups, hotel pickup, free cancellation.",
    lead: "Lakes, south-coast villages and the pink sand of Elafonisi — days that stay outdoors without a coach timetable.",
  },
  "cretan-history-tours": {
    label: "Cretan History",
    short: "Cretan History",
    seoTitle: "Cretan History Tours from Rethymno | Villages, Monasteries, Spinalonga",
    seoDesc:
      "History days from Rethymno: mountain villages and monasteries, or a private run to Spinalonga. Local hosts, small groups, hotel pickup.",
    lead: "Monasteries, Venetian harbours and the island of Spinalonga — history told by people who live with it.",
  },
  "cretan-culture-tours": {
    label: "Culture",
    short: "Culture",
    seoTitle: "Cretan Culture Tours from Rethymno | Shepherd Day & Knossos",
    seoDesc:
      "A working shepherd's day in the mountains, or a private morning at Knossos. Culture tours from Rethymno with a local host.",
    lead: "A working shepherd's day, and a private morning at Knossos — culture you join, not watch from a rope line.",
  },
  "cretan-gastronomy-food-tours": {
    label: "Cretan Gastronomy",
    short: "Gastronomy",
    seoTitle: "Cretan Gastronomy & Food Tours from Rethymno",
    seoDesc:
      "Village cooking, an Old Town tasting walk, honey and wine. Food tours from Rethymno with producers, not a tourist menu.",
    lead: "Village kitchens, Old Town tastings, honey and wine — the island on a plate, without a coach buffet.",
  },
  "hiking-trekking-from-rethymno": {
    label: "Hiking & Trekking Tours from Rethymno",
    short: "Hiking & Trekking",
    seoTitle: "Hiking & Trekking Tours from Rethymno | Imbros, Samaria, Pachnes",
    seoDesc:
      "Gorge days and a White Mountains summit from Rethymno: Imbros, Samaria, Aradaina and Pachnes. Small groups, hotel pickup.",
    lead: "Gorges and a White Mountains summit, run from Rethymno — family-scale Imbros through to a private Pachnes day.",
  },
  "signature-experiences": {
    label: "Signature Experiences",
    short: "Signature",
    seoTitle: "Signature Experiences in Crete | Taste, Romance, Wildflowers, Sunset",
    seoDesc:
      "The days guests write home about: Taste of Crete, a private Old Town evening, spring wildflowers, and sunset sound therapy.",
    lead: "The days guests write home about — food, an Old Town evening for two, spring flowers, and sound at last light.",
  },
  "multiday-tours": {
    label: "Multiday Tours",
    short: "Multiday",
    seoTitle: "Multiday Tours in Crete | Spring Wildflowers & Orchids",
    seoDesc:
      "A week in the Cretan spring: wildflowers and orchids with botanists, based around Spili. Early booking from €990.",
    lead: "A week in the wildflowers, with botanists — the only multiday departure we publish as a product.",
  },
};

const DE: Record<HubId, HubCopy> = {
  "outdoor-activities-nature-tours-crete": {
    label: "Outdoor und Naturtouren auf Kreta",
    short: "Outdoor & Natur",
    seoTitle: "Outdoor und Naturtouren auf Kreta | Ab Rethymno",
    seoDesc:
      "Private Naturtage ab Rethymno: Kournas-See, Dorflandstraßen, die Südküste und der rosa Sand von Elafonisi. Kleine Gruppen, Hotelabholung, kostenlose Stornierung.",
    lead: "Seen, Dörfer an der Südküste und der rosa Sand von Elafonisi — Tage draußen, ohne Reisebus-Fahrplan.",
  },
  "cretan-history-tours": {
    label: "Kretische Geschichte",
    short: "Geschichte",
    seoTitle: "Geschichtstouren auf Kreta ab Rethymno | Dörfer, Klöster, Spinalonga",
    seoDesc:
      "Geschichtstage ab Rethymno: Bergdörfer und Klöster, oder eine private Fahrt nach Spinalonga. Lokale Gastgeber, kleine Gruppen, Hotelabholung.",
    lead: "Klöster, venezianische Häfen und die Insel Spinalonga — Geschichte von Menschen, die damit leben.",
  },
  "cretan-culture-tours": {
    label: "Kultur",
    short: "Kultur",
    seoTitle: "Kultur-Touren auf Kreta ab Rethymno | Schäfertag und Knossos",
    seoDesc:
      "Ein Arbeitstag bei einem Schäfer in den Bergen, oder ein privater Vormittag in Knossos. Kulturtouren ab Rethymno mit einem lokalen Gastgeber.",
    lead: "Ein Arbeitstag beim Schäfer und ein privater Vormittag in Knossos — Kultur, die man mitmacht, nicht hinter einer Absperrung.",
  },
  "cretan-gastronomy-food-tours": {
    label: "Kretische Gastronomie",
    short: "Gastronomie",
    seoTitle: "Kretische Gastronomie und Food-Touren ab Rethymno",
    seoDesc:
      "Dorfküche, ein Tasting-Spaziergang in der Altstadt, Honig und Wein. Food-Touren ab Rethymno bei Erzeugern, nicht auf einer Touristenkarte.",
    lead: "Dorfküchen, Altstadt-Verkostungen, Honig und Wein — die Insel auf dem Teller, ohne Reisebus-Buffet.",
  },
  "hiking-trekking-from-rethymno": {
    label: "Wander- und Trekkingtouren ab Rethymno",
    short: "Wandern & Trekking",
    seoTitle: "Wander- und Trekkingtouren ab Rethymno | Imbros, Samaria, Pachnes",
    seoDesc:
      "Schluchttage und ein Gipfel in den Lefka Ori ab Rethymno: Imbros, Samaria, Aradaina und Pachnes. Kleine Gruppen, Hotelabholung.",
    lead: "Schluchten und ein Lefka-Ori-Gipfel, ab Rethymno — familiengerechtes Imbros bis zu einem privaten Pachnes-Tag.",
  },
  "signature-experiences": {
    label: "Signature-Erlebnisse",
    short: "Signature",
    seoTitle: "Signature-Erlebnisse auf Kreta | Geschmack, Romantik, Wildblumen, Sonnenuntergang",
    seoDesc:
      "Die Tage, von denen Gäste nach Hause schreiben: Taste of Crete, ein privater Abend in der Altstadt, Frühlingswildblumen und Klangtherapie im Sonnenuntergang.",
    lead: "Die Tage, von denen Gäste schreiben — Essen, ein Altstadtabend zu zweit, Frühlingsblumen und Klang im letzten Licht.",
  },
  "multiday-tours": {
    label: "Mehrtagesreisen",
    short: "Mehrtages",
    seoTitle: "Mehrtagesreisen auf Kreta | Frühlingswildblumen und Orchideen",
    seoDesc:
      "Eine Woche im kretischen Frühling: Wildblumen und Orchideen mit Botanikern, rund um Spili. Frühbucher ab 990 €.",
    lead: "Eine Woche in den Wildblumen, mit Botanikern — die einzige Mehrtages-Abfahrt, die wir als Produkt führen.",
  },
};

const IT: Record<HubId, HubCopy> = {
  "outdoor-activities-nature-tours-crete": {
    label: "Attività outdoor e natura a Creta",
    short: "Outdoor e natura",
    seoTitle: "Attività outdoor e natura a Creta | Da Rethymno",
    seoDesc:
      "Giornate private nella natura da Rethymno: lago Kournas, strade di villaggio, la costa sud e la sabbia rosa di Elafonisi. Gruppi piccoli, ritiro in hotel, cancellazione gratuita.",
    lead: "Laghi, villaggi della costa sud e la sabbia rosa di Elafonisi — giornate all'aperto, senza orario da pullman.",
  },
  "cretan-history-tours": {
    label: "Storia di Creta",
    short: "Storia",
    seoTitle: "Tour di storia cretese da Rethymno | Villaggi, monasteri, Spinalonga",
    seoDesc:
      "Giornate di storia da Rethymno: villaggi di montagna e monasteri, o una corsa privata a Spinalonga. Host locali, gruppi piccoli, ritiro in hotel.",
    lead: "Monasteri, porti veneziani e l'isola di Spinalonga — storia raccontata da chi ci vive.",
  },
  "cretan-culture-tours": {
    label: "Cultura",
    short: "Cultura",
    seoTitle: "Tour di cultura cretese da Rethymno | Giorno da pastore e Cnosso",
    seoDesc:
      "Una giornata di lavoro con un pastore in montagna, o una mattina privata a Cnosso. Tour culturali da Rethymno con un host locale.",
    lead: "Una giornata da pastore e una mattina privata a Cnosso — cultura a cui si partecipa, non da cordone.",
  },
  "cretan-gastronomy-food-tours": {
    label: "Gastronomia cretese",
    short: "Gastronomia",
    seoTitle: "Gastronomia e food tour cretesi da Rethymno",
    seoDesc:
      "Cucina di villaggio, una passeggiata di assaggi in Città Vecchia, miele e vino. Food tour da Rethymno con i produttori, non un menù da turisti.",
    lead: "Cucine di villaggio, assaggi in Città Vecchia, miele e vino — l'isola nel piatto, senza buffet da pullman.",
  },
  "hiking-trekking-from-rethymno": {
    label: "Trekking da Rethymno",
    short: "Trekking",
    seoTitle: "Trekking da Rethymno | Imbros, Samaria, Pachnes",
    seoDesc:
      "Giornate in gola e una vetta dei Lefka Ori da Rethymno: Imbros, Samaria, Aradaina e Pachnes. Gruppi piccoli, ritiro in hotel.",
    lead: "Gole e una vetta dei Lefka Ori, da Rethymno — Imbros in scala famiglia fino a un Pachnes privato.",
  },
  "signature-experiences": {
    label: "Esperienze signature",
    short: "Signature",
    seoTitle: "Esperienze signature a Creta | Gusto, romance, fiori, tramonto",
    seoDesc:
      "I giorni di cui gli ospiti scrivono a casa: Taste of Crete, una serata privata in Città Vecchia, fiori di primavera e sound therapy al tramonto.",
    lead: "I giorni di cui si scrive — cibo, una serata in Città Vecchia in due, fiori di primavera e suono all'ultima luce.",
  },
  "multiday-tours": {
    label: "Tour di più giorni",
    short: "Più giorni",
    seoTitle: "Tour di più giorni a Creta | Fiori di primavera e orchidee",
    seoDesc:
      "Una settimana nella primavera cretese: fiori e orchidee con botanici, intorno a Spili. Prenotazione anticipata da 990 €.",
    lead: "Una settimana tra i fiori, con botanici — l'unica partenza di più giorni che pubblichiamo come prodotto.",
  },
};

const FR: Record<HubId, HubCopy> = {
  "outdoor-activities-nature-tours-crete": {
    label: "Activités outdoor et nature en Crète",
    short: "Outdoor & nature",
    seoTitle: "Activités outdoor et nature en Crète | Depuis Réthymnon",
    seoDesc:
      "Journées nature privées depuis Réthymnon : lac Kournas, routes de villages, la côte sud et le sable rose d'Elafonisi. Petits groupes, prise en charge à l'hôtel, annulation gratuite.",
    lead: "Lacs, villages de la côte sud et le sable rose d'Elafonisi — des journées dehors, sans horaire de car.",
  },
  "cretan-history-tours": {
    label: "Histoire crétoise",
    short: "Histoire",
    seoTitle: "Excursions d'histoire crétoise depuis Réthymnon | Villages, monastères, Spinalonga",
    seoDesc:
      "Journées d'histoire depuis Réthymnon : villages de montagne et monastères, ou une course privée à Spinalonga. Hôtes locaux, petits groupes, prise en charge à l'hôtel.",
    lead: "Monastères, ports vénitiens et l'île de Spinalonga — l'histoire racontée par ceux qui vivent avec.",
  },
  "cretan-culture-tours": {
    label: "Culture",
    short: "Culture",
    seoTitle: "Excursions culturelles en Crète depuis Réthymnon | Jour de berger et Cnossos",
    seoDesc:
      "Une journée de travail avec un berger en montagne, ou une matinée privée à Cnossos. Excursions culturelles depuis Réthymnon avec un hôte local.",
    lead: "Une journée chez le berger et une matinée privée à Cnossos — une culture qu'on rejoint, pas qu'on regarde derrière une corde.",
  },
  "cretan-gastronomy-food-tours": {
    label: "Gastronomie crétoise",
    short: "Gastronomie",
    seoTitle: "Gastronomie et food tours crétois depuis Réthymnon",
    seoDesc:
      "Cuisine de village, une balade dégustation dans la vieille ville, miel et vin. Food tours depuis Réthymnon chez les producteurs, pas un menu touristique.",
    lead: "Cuisines de village, dégustations en vieille ville, miel et vin — l'île dans l'assiette, sans buffet de car.",
  },
  "hiking-trekking-from-rethymno": {
    label: "Randonnées depuis Réthymnon",
    short: "Randonnée",
    seoTitle: "Randonnées depuis Réthymnon | Imbros, Samaria, Pachnes",
    seoDesc:
      "Journées de gorges et un sommet des Lefka Ori depuis Réthymnon : Imbros, Samaria, Aradaina et Pachnes. Petits groupes, prise en charge à l'hôtel.",
    lead: "Gorges et un sommet des Lefka Ori, depuis Réthymnon — Imbros à l'échelle familiale jusqu'à une journée privée au Pachnes.",
  },
  "signature-experiences": {
    label: "Expériences signature",
    short: "Signature",
    seoTitle: "Expériences signature en Crète | Goût, romance, fleurs, coucher de soleil",
    seoDesc:
      "Les journées dont les voyageurs écrivent : Taste of Crete, une soirée privée en vieille ville, fleurs de printemps et sound therapy au coucher du soleil.",
    lead: "Les journées dont on écrit — la table, une soirée en vieille ville à deux, les fleurs de printemps et le son à la dernière lumière.",
  },
  "multiday-tours": {
    label: "Circuits de plusieurs jours",
    short: "Plusieurs jours",
    seoTitle: "Circuits de plusieurs jours en Crète | Fleurs de printemps et orchidées",
    seoDesc:
      "Une semaine dans le printemps crétois : fleurs et orchidées avec des botanistes, autour de Spili. Réservation anticipée dès 990 €.",
    lead: "Une semaine dans les fleurs, avec des botanistes — le seul départ de plusieurs jours que nous publions comme produit.",
  },
};

const SV: Record<HubId, HubCopy> = {
  "outdoor-activities-nature-tours-crete": {
    label: "Utomhus och naturturer på Kreta",
    short: "Utomhus & natur",
    seoTitle: "Utomhus och naturturer på Kreta | Från Rethymno",
    seoDesc:
      "Privata naturdagar från Rethymno: sjön Kournas, byvägar, sydkusten och den rosa sanden på Elafonisi. Små grupper, hotellhämtning, gratis avbokning.",
    lead: "Sjöar, byar på sydkusten och den rosa sanden på Elafonisi — dagar utomhus, utan busschema.",
  },
  "cretan-history-tours": {
    label: "Kretensisk historia",
    short: "Historia",
    seoTitle: "Historieturer på Kreta från Rethymno | Byar, kloster, Spinalonga",
    seoDesc:
      "Historiedagar från Rethymno: bergsbyar och kloster, eller en privat körning till Spinalonga. Lokala värdar, små grupper, hotellhämtning.",
    lead: "Kloster, venetianska hamnar och ön Spinalonga — historia berättad av dem som lever med den.",
  },
  "cretan-culture-tours": {
    label: "Kultur",
    short: "Kultur",
    seoTitle: "Kulturturer på Kreta från Rethymno | Herdedag och Knossos",
    seoDesc:
      "En arbetsdag hos en herde i bergen, eller en privat förmiddag i Knossos. Kulturturer från Rethymno med en lokal värd.",
    lead: "En herdedag och en privat förmiddag i Knossos — kultur man är med i, inte bakom ett snöre.",
  },
  "cretan-gastronomy-food-tours": {
    label: "Kretensisk gastronomi",
    short: "Gastronomi",
    seoTitle: "Kretensisk gastronomi och matturer från Rethymno",
    seoDesc:
      "Bymatlagning, en smakpromenad i gamla stan, honung och vin. Matturer från Rethymno hos producenter, inte en turistmeny.",
    lead: "Bykök, smakningar i gamla stan, honung och vin — ön på tallriken, utan bussbuffé.",
  },
  "hiking-trekking-from-rethymno": {
    label: "Vandring från Rethymno",
    short: "Vandring",
    seoTitle: "Vandring från Rethymno | Imbros, Samaria, Pachnes",
    seoDesc:
      "Ravindagar och en topp i Lefka Ori från Rethymno: Imbros, Samaria, Aradaina och Pachnes. Små grupper, hotellhämtning.",
    lead: "Raviner och en Lefka Ori-topp, från Rethymno — familjeskala Imbros ända till en privat Pachnes-dag.",
  },
  "signature-experiences": {
    label: "Signature-upplevelser",
    short: "Signature",
    seoTitle: "Signature-upplevelser på Kreta | Smak, romantik, blommor, solnedgång",
    seoDesc:
      "Dagarna gäster skriver hem om: Taste of Crete, en privat kväll i gamla stan, vårblommor och ljudterapi i solnedgången.",
    lead: "Dagarna man skriver om — mat, en kväll i gamla stan för två, vårblommor och ljud i sista ljuset.",
  },
  "multiday-tours": {
    label: "Flerdagarsturer",
    short: "Flera dagar",
    seoTitle: "Flerdagarsturer på Kreta | Vårblommor och orkidéer",
    seoDesc:
      "En vecka i den kretensiska våren: vilda blommor och orkidéer med botaniker, runt Spili. Tidig bokning från 990 €.",
    lead: "En vecka bland blommorna, med botaniker — den enda flerdagarsavgång vi publicerar som produkt.",
  },
};

export const HUB_COPY: Record<Lang, Record<HubId, HubCopy>> = {
  en: EN,
  de: DE,
  it: IT,
  fr: FR,
  sv: SV,
};

export function hubCopy(lang: Lang, id: HubId): HubCopy {
  return HUB_COPY[lang][id] ?? EN[id];
}
