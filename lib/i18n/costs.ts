import type { Lang } from "./langs";

/**
 * Third-party cost labels live on tour.json (language-neutral structure).
 * These are the on-the-day extras shown in the booking widget.
 */
const COSTS: Record<string, Record<Exclude<Lang, "en">, string>> = {
  "Arkadi Monastery entrance fee": {
    de: "Eintritt Kloster Arkadi",
    it: "Ingresso monastero di Arkadi",
    fr: "Entrée du monastère d'Arkadi",
    sv: "Entré klostret Arkadi",
  },
  "Eleftherna Archaeological Site and Museum entrance fee": {
    de: "Eintritt Ausgrabung und Museum Eleftherna",
    it: "Ingresso scavi e museo di Eleftherna",
    fr: "Entrée du site et musée d'Eleftherna",
    sv: "Entré utgrävning och museum Eleftherna",
  },
  "Melidoni Cave entrance fee": {
    de: "Eintritt Melidoni-Höhle",
    it: "Ingresso grotta di Melidoni",
    fr: "Entrée de la grotte de Melidoni",
    sv: "Entré Melidoni-grottan",
  },
  "Certified guide": {
    de: "Zertifizierter Guide",
    it: "Guida certificata",
    fr: "Guide certifié",
    sv: "Certifierad guide",
  },
  "Food and drinks": {
    de: "Speisen und Getränke",
    it: "Cibo e bevande",
    fr: "Repas et boissons",
    sv: "Mat och dryck",
  },
  "Kourtaliotiko Gorge admission": {
    de: "Eintritt Schlucht Kourtaliotiko",
    it: "Ingresso gola di Kourtaliotiko",
    fr: "Entrée des gorges de Kourtaliotiko",
    sv: "Entré Kourtaliotiko-ravinen",
  },
  "Optional lunch at a seaside taverna": {
    de: "Optionales Mittagessen in einer Taverne am Meer",
    it: "Pranzo facoltativo in una taverna sul mare",
    fr: "Déjeuner optionnel dans une taverne au bord de mer",
    sv: "Valfri lunch på en taverna vid havet",
  },
  "Samaria Gorge entrance fee": {
    de: "Eintritt Samaria-Schlucht",
    it: "Ingresso gola di Samaria",
    fr: "Entrée des gorges de Samaria",
    sv: "Entré Samaria-ravinen",
  },
  "Ferry ticket, Agia Roumeli to Chora Sfakion (adult)": {
    de: "Fähre Agia Roumeli–Chora Sfakion (Erwachsene)",
    it: "Traghetto Agia Roumeli–Chora Sfakion (adulto)",
    fr: "Ferry Agia Roumeli–Chora Sfakion (adulte)",
    sv: "Färja Agia Roumeli–Chora Sfakion (vuxen)",
  },
  "Ferry ticket, Agia Roumeli to Chora Sfakion (child 5-12)": {
    de: "Fähre Agia Roumeli–Chora Sfakion (Kind 5–12)",
    it: "Traghetto Agia Roumeli–Chora Sfakion (bambino 5-12)",
    fr: "Ferry Agia Roumeli–Chora Sfakion (enfant 5-12)",
    sv: "Färja Agia Roumeli–Chora Sfakion (barn 5–12)",
  },
  "Bus transfer from the end of the gorge to Agia Roumeli": {
    de: "Bus vom Schluchtende nach Agia Roumeli",
    it: "Bus dalla fine della gola ad Agia Roumeli",
    fr: "Bus de la fin des gorges à Agia Roumeli",
    sv: "Buss från ravinens slut till Agia Roumeli",
  },
  "Optional taverna lunch in Anopoli after the hike": {
    de: "Optionales Taverne-Mittagessen in Anopoli nach der Tour",
    it: "Pranzo facoltativo in taverna ad Anopoli dopo l'escursione",
    fr: "Déjeuner optionnel à Anopoli après la randonnée",
    sv: "Valfri tavernalunch i Anopoli efter vandringen",
  },
  "Preveli Monastery admission": {
    de: "Eintritt Kloster Preveli",
    it: "Ingresso monastero di Preveli",
    fr: "Entrée du monastère de Preveli",
    sv: "Entré klostret Preveli",
  },
  "Lunch at a Triopetra taverna": {
    de: "Mittagessen in einer Taverne in Triopetra",
    it: "Pranzo in una taverna a Triopetra",
    fr: "Déjeuner dans une taverne à Triopetra",
    sv: "Lunch på en taverna i Triopetra",
  },
  "Boat tickets to and from Spinalonga": {
    de: "Bootstickets hin und zurück nach Spinalonga",
    it: "Biglietti del battello da e per Spinalonga",
    fr: "Billets de bateau aller-retour pour Spinalonga",
    sv: "Båtbiljetter tur och retur till Spinalonga",
  },
  "Spinalonga island entrance fee": {
    de: "Eintritt Insel Spinalonga",
    it: "Ingresso isola di Spinalonga",
    fr: "Entrée de l'île de Spinalonga",
    sv: "Entré ön Spinalonga",
  },
  "Professional licensed guide on the island": {
    de: "Lizenzierter Guide auf der Insel",
    it: "Guida professionista abilitata sull'isola",
    fr: "Guide professionnel diplômé sur l'île",
    sv: "Licensierad guide på ön",
  },
  "Lunch in Plaka": {
    de: "Mittagessen in Plaka",
    it: "Pranzo a Plaka",
    fr: "Déjeuner à Plaka",
    sv: "Lunch i Plaka",
  },
  "Sunbed and umbrella hire at Elafonisi": {
    de: "Liege und Sonnenschirm in Elafonisi",
    it: "Noleggio lettino e ombrellone a Elafonisi",
    fr: "Location de transat et parasol à Elafonisi",
    sv: "Solstol och parasoll på Elafonisi",
  },
  "Lunch or snacks at the beachside tavernas": {
    de: "Mittagessen oder Snacks in den Tavernen am Strand",
    it: "Pranzo o snack nelle taverne in spiaggia",
    fr: "Déjeuner ou encas dans les tavernes de la plage",
    sv: "Lunch eller fika på tavernorna vid stranden",
  },
  "Gorge entrance fee": {
    de: "Eintritt in die Schlucht",
    it: "Ingresso alla gola",
    fr: "Droit d'entrée des gorges",
    sv: "Entré till ravinen",
  },
  "Private boat taxi from Marmara Beach": {
    de: "Privates Bootstaxi ab Marmara Beach",
    it: "Taxi-barca privato da Marmara Beach",
    fr: "Taxi-bateau privé depuis Marmara Beach",
    sv: "Privat båttaxi från Marmara Beach",
  },
  "Imbros Gorge entrance fee": {
    de: "Eintritt Imbros-Schlucht",
    it: "Ingresso gola di Imbros",
    fr: "Entrée des gorges d'Imbros",
    sv: "Entré Imbros-ravinen",
  },
  "Pedal boat hire on Lake Kournas": {
    de: "Tretbootverleih am Kournas-See",
    it: "Noleggio pedalò sul lago Kournas",
    fr: "Location de pédalo sur le lac Kournas",
    sv: "Cykelbåt på Kournassjön",
  },
  "Food and drinks at the lakeside and spring-side tavernas": {
    de: "Speisen und Getränke an See und Quellen",
    it: "Cibo e bevande alle taverne del lago e delle sorgenti",
    fr: "Repas et boissons aux tavernes du lac et des sources",
    sv: "Mat och dryck vid sjön och källorna",
  },
  "Palace of Knossos entrance ticket": {
    de: "Eintritt Palast von Knossos",
    it: "Biglietto palazzo di Cnosso",
    fr: "Billet du palais de Knossos",
    sv: "Entré palatset i Knossos",
  },
  "Heraklion Archaeological Museum entrance ticket": {
    de: "Eintritt Archäologisches Museum Heraklion",
    it: "Biglietto Museo archeologico di Heraklion",
    fr: "Billet du musée archéologique d'Héraklion",
    sv: "Entré arkeologiska museet i Heraklion",
  },
};

export function costLabel(lang: Lang, english: string): string {
  if (lang === "en") return english;
  return COSTS[english]?.[lang] ?? english;
}
