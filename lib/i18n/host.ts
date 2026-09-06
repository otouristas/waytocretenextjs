import type { Lang } from "./langs";

/**
 * The host section on the About page.
 *
 * Its own module rather than more rows in `lib/i18n/ui.ts`, for the reason
 * photography and partners have theirs: `UI` is already three hundred fields
 * wide across five locales, and a block of running prose should not widen
 * every unrelated page's translation table.
 *
 * The photographs are shared across locales and live here beside the alt
 * text that describes them, so a caption can never drift from its picture.
 */

export type HostCopy = {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
};

/**
 * Way to Crete imagery, still hot-linked from the sister WordPress site like
 * the rest of the catalogue — see the `remotePatterns` note in next.config.
 *
 * The alt text describes the landscape, which is what these frames actually
 * show. Captioning them as portraits of Ernest would put a claim in the
 * accessibility layer that the pictures do not support.
 */
export const HOST_IMAGES = [
  {
    src: "https://waytocrete.com/wp-content/uploads/2025/02/lefka-ori-23-scaled.jpg",
    alt: "The Lefka Ori, the White Mountains rising above south-west Crete",
  },
  {
    src: "https://waytocrete.com/wp-content/uploads/2025/12/lefka-ori-2-scaled.jpg",
    alt: "High ground in the Lefka Ori, above the treeline",
  },
  {
    src: "https://waytocrete.com/wp-content/uploads/2025/02/imbros-19-scaled.jpg",
    alt: "The walls of the Imbros Gorge on the walk down towards Komitades",
  },
] as const;

const EN: HostCopy = {
  eyebrow: "Your host",
  title: "Meet Your Local Host – Ernest",
  paragraphs: [
    "Ernest is a local host at Way to Crete, and he simply does what he has always loved doing — showing people the Crete he knows and lives every day.",
    "He grew up on the island, so for him these places are not “stops on a tour”, but familiar landscapes, villages, paths, and stories connected to real life. Over time, this turned into sharing Crete with visitors who want something more genuine than a standard excursion.",
    "When you join an experience with Ernest, it’s relaxed and unforced. He explains things in a simple way, answers questions naturally, and adjusts the day depending on the group and the moment. Nothing feels scripted or rushed — it’s more like spending the day with someone who knows the area well and enjoys showing it.",
    "What people often mention afterwards is how easy and comfortable the experience felt. Not just what they saw, but the atmosphere of the day.",
    "For Ernest, that’s the point: to keep things real, simple, and honest, and to help people experience Crete in a way that feels natural.",
  ],
};

const DE: HostCopy = {
  eyebrow: "Ihr Gastgeber",
  title: "Lernen Sie Ihren lokalen Gastgeber kennen – Ernest",
  paragraphs: [
    "Ernest ist lokaler Gastgeber bei Way to Crete, und er tut schlicht das, was er immer schon gern getan hat — Menschen das Kreta zeigen, das er kennt und täglich lebt.",
    "Er ist auf der Insel aufgewachsen, deshalb sind diese Orte für ihn keine „Stationen einer Tour“, sondern vertraute Landschaften, Dörfer, Wege und Geschichten, die mit echtem Leben verbunden sind. Mit der Zeit wurde daraus das Teilen Kretas mit Gästen, die etwas Echteres wollen als eine Standardexkursion.",
    "Wenn Sie mit Ernest unterwegs sind, ist es entspannt und ungezwungen. Er erklärt Dinge einfach, beantwortet Fragen ganz natürlich und passt den Tag der Gruppe und dem Moment an. Nichts wirkt einstudiert oder gehetzt — es ist eher, als verbrächte man den Tag mit jemandem, der die Gegend gut kennt und sie gern zeigt.",
    "Was Gäste hinterher oft erwähnen, ist, wie leicht und angenehm sich der Tag angefühlt hat. Nicht nur, was sie gesehen haben, sondern die Atmosphäre des Tages.",
    "Für Ernest ist genau das der Punkt: echt, einfach und ehrlich bleiben und Menschen helfen, Kreta auf eine Weise zu erleben, die sich natürlich anfühlt.",
  ],
};

const IT: HostCopy = {
  eyebrow: "Il vostro host",
  title: "Conoscete il vostro host locale – Ernest",
  paragraphs: [
    "Ernest è un host locale di Way to Crete, e fa semplicemente ciò che ha sempre amato fare: mostrare alle persone la Creta che conosce e vive ogni giorno.",
    "È cresciuto sull’isola, quindi per lui questi luoghi non sono “tappe di un tour”, ma paesaggi familiari, villaggi, sentieri e storie legate alla vita vera. Con il tempo, questo è diventato condividere Creta con chi cerca qualcosa di più autentico di un’escursione standard.",
    "Quando partecipate a un’esperienza con Ernest, tutto è rilassato e senza forzature. Spiega le cose in modo semplice, risponde alle domande con naturalezza e adatta la giornata al gruppo e al momento. Niente sembra a copione o di corsa: è più come passare la giornata con qualcuno che conosce bene la zona e ha piacere di mostrarla.",
    "Quello che le persone spesso raccontano dopo è quanto sia stato facile e piacevole. Non solo ciò che hanno visto, ma l’atmosfera della giornata.",
    "Per Ernest il punto è proprio questo: restare veri, semplici e onesti, e aiutare le persone a vivere Creta in un modo che sembri naturale.",
  ],
};

const FR: HostCopy = {
  eyebrow: "Votre hôte",
  title: "Rencontrez votre hôte local – Ernest",
  paragraphs: [
    "Ernest est hôte local chez Way to Crete, et il fait simplement ce qu’il a toujours aimé faire : montrer aux gens la Crète qu’il connaît et vit chaque jour.",
    "Il a grandi sur l’île, alors pour lui ces endroits ne sont pas des « étapes d’une excursion », mais des paysages familiers, des villages, des sentiers et des histoires liées à la vie réelle. Avec le temps, c’est devenu le partage de la Crète avec des visiteurs qui veulent quelque chose de plus vrai qu’une excursion standard.",
    "Quand vous partez avec Ernest, c’est détendu et sans façon. Il explique simplement, répond aux questions naturellement et adapte la journée au groupe et au moment. Rien ne paraît écrit d’avance ni pressé : c’est plutôt passer la journée avec quelqu’un qui connaît bien la région et aime la montrer.",
    "Ce que les gens mentionnent souvent après, c’est à quel point la journée a été simple et agréable. Pas seulement ce qu’ils ont vu, mais l’atmosphère du jour.",
    "Pour Ernest, c’est tout l’intérêt : rester vrai, simple et honnête, et aider les gens à vivre la Crète d’une manière qui semble naturelle.",
  ],
};

const SV: HostCopy = {
  eyebrow: "Er värd",
  title: "Möt er lokala värd – Ernest",
  paragraphs: [
    "Ernest är lokal värd på Way to Crete, och han gör helt enkelt det han alltid har älskat att göra — visa människor det Kreta han känner och lever varje dag.",
    "Han växte upp på ön, så för honom är de här platserna inte ”stopp på en tur”, utan välbekanta landskap, byar, stigar och berättelser som hänger ihop med verkligt liv. Med tiden blev det att dela Kreta med besökare som vill ha något äkta snarare än en standardutflykt.",
    "När ni följer med Ernest är det avslappnat och otvunget. Han förklarar enkelt, svarar naturligt på frågor och anpassar dagen efter gruppen och stunden. Ingenting känns inövat eller stressat — det är mer som att tillbringa dagen med någon som kan trakten väl och tycker om att visa den.",
    "Det gäster ofta nämner efteråt är hur lätt och bekvämt det kändes. Inte bara vad de såg, utan stämningen under dagen.",
    "För Ernest är det just det som är poängen: att hålla det äkta, enkelt och ärligt, och hjälpa människor uppleva Kreta på ett sätt som känns naturligt.",
  ],
};

const COPY: Record<Lang, HostCopy> = { en: EN, de: DE, it: IT, fr: FR, sv: SV };

export function hostCopy(lang: Lang): HostCopy {
  return COPY[lang] ?? EN;
}
