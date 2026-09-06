import type { Lang } from "./langs";

/**
 * Chrome copy for the photography section.
 *
 * Section-scoped rather than dumped into `lib/i18n/ui.ts`, for the same
 * reason transfers and partners have their own modules: `UI` is already 300
 * fields wide across five locales, and a section that will grow more products
 * should not make every unrelated page's translation table wider.
 *
 * Product prose (titles, package names, the curriculum) lives in
 * `content/photography/{slug}/{lang}.json`. Everything here is furniture —
 * headings, labels and calls to action that stay the same however many
 * photography products the operator adds.
 */

export type PhotographyUI = {
  /* nav + section identity */
  nav: string;
  experienceNav: string;
  workshopNav: string;
  experienceChips: readonly string[];
  workshopChips: readonly string[];

  /* the hub */
  hubSeoTitle: string;
  hubSeoDesc: string;
  hubKicker: string;
  hubTitle: string;
  hubLead: string;
  hubCtaExperience: string;
  hubCtaWorkshop: string;
  differenceTitle: string;
  differenceLead: string;
  weShootYou: string;
  youLearn: string;
  viewDetails: string;

  /* family hubs */
  experienceKicker: string;
  experienceTitle: string;
  experienceLead: string;
  experienceSeoTitle: string;
  experienceSeoDesc: string;
  workshopKicker: string;
  workshopTitle: string;
  workshopLead: string;
  workshopSeoTitle: string;
  workshopSeoDesc: string;

  /* packages */
  packagesTitle: string;
  packagesLead: string;
  mostPopular: string;
  upToPeople: string;
  locationOne: string;
  locationsN: string;
  locationsRange: string;
  photosRange: string;
  photosPlus: string;
  qualityTitle: string;
  qualityLead: string;
  transportIncluded: string;
  goldenHourOption: string;
  customTitle: string;
  customLead: string;
  customCta: string;

  /* settings + positioning */
  settingsTitle: string;
  settingsLead: string;
  notStudioTitle: string;
  notStudioLead: string;
  addOnTitle: string;
  addOnLead: string;
  addOnCta: string;

  /* workshop */
  curriculumTitle: string;
  curriculumLead: string;
  day: string;
  departuresTitle: string;
  departuresLead: string;
  statusConfirmed: string;
  statusForming: string;
  statusLimited: string;
  limitedNote: string;
  requestToJoin: string;
  bookDeparture: string;
  spotsLeft: string;
  groupSize: string;
  groupNote: string;
  datesTba: string;
  gearTitle: string;
  gearLead: string;
  gearDslr: string;
  gearMirrorless: string;
  gearCompact: string;
  gearSmartphone: string;
  levelTitle: string;
  levelLead: string;
  earlyBird: string;
  standardPrice: string;
  seasonsTitle: string;

  /* request form */
  formExperienceTitle: string;
  formWorkshopTitle: string;
  formLead: string;
  formPackage: string;
  formDeparture: string;
  formCustom: string;
  formNoPayment: string;
  formSend: string;
};

const EN: PhotographyUI = {
  nav: "Photography",
  experienceNav: "Photography Experience",
  workshopNav: "Multi-Day Photography",
  experienceChips: ["1–4 hours", "Half day", "Full day", "Custom / private"],
  workshopChips: ["Beginner friendly", "Small group", "Seasonal departures"],

  hubSeoTitle: "Photography in Crete | Photoshoots & 4-Day Workshops",
  hubSeoDesc:
    "Two ways to work with a photographer in Crete: an outdoor photoshoot of you in the island's landscapes, or a four-day beginner workshop where you learn to shoot it yourself.",
  hubKicker: "Photography in Crete",
  hubTitle: "See Crete. Feel Crete. Photograph Crete.",
  hubLead:
    "Beaches, mountains, old towns and olive groves — and a photographer who knows where the light lands. Have your days photographed for you, or spend four of them learning to do it yourself.",
  hubCtaExperience: "Book a photoshoot",
  hubCtaWorkshop: "Join a workshop",
  differenceTitle: "Two different things, on purpose",
  differenceLead:
    "One puts you in front of the camera. The other puts the camera in your hands. Pick the one you actually want — they are not versions of each other.",
  weShootYou: "We photograph you",
  youLearn: "You learn to photograph",
  viewDetails: "View details",

  experienceKicker: "Photography Experience",
  experienceTitle: "Professional photos of you, out in Crete",
  experienceLead:
    "A photographer joins you for an hour or a full day, takes you to the locations that suit the light, and hands back a gallery of natural portraits — no studio, no posing script.",
  experienceSeoTitle: "Photoshoot in Crete | Photography Experience from Rethymno",
  experienceSeoDesc:
    "Book a professional outdoor photoshoot in Crete: beaches, villages, gorges and Golden Hour. Sessions from one hour to a full day, from €160, with an online gallery.",
  workshopKicker: "Multi-Day Photography",
  workshopTitle: "You don't just visit Crete. You learn how to photograph it.",
  workshopLead:
    "Small-group photography escapes for beginners and enthusiasts. Four days of landscapes, villages and light, with a professional instructor and whatever camera you already own.",
  workshopSeoTitle: "Photography Workshops in Crete | 4-Day Beginner Escape",
  workshopSeoDesc:
    "A four-day beginner photography workshop in Crete. Small groups of four to six, daily lessons, sunrise and sunset sessions, DSLR, mirrorless, compact or smartphone.",

  packagesTitle: "Choose your session",
  packagesLead:
    "Every package is a real shoot with a real photographer, delivered as a private online gallery.",
  mostPopular: "Most popular",
  upToPeople: "Up to {n} people",
  locationOne: "1 location",
  locationsN: "{n} locations",
  locationsRange: "{min}–{max} locations",
  photosRange: "{min}–{max} professionally edited photos",
  photosPlus: "{n}+ professionally edited photos",
  qualityTitle: "Quality, not quantity",
  qualityLead:
    "The counts above are photographs we have selected, colour-graded and retouched — not everything the shutter caught. A smaller set of images you will actually use beats a folder of a thousand you never open.",
  transportIncluded: "Private transport between locations",
  goldenHourOption: "Golden Hour session when the light allows",
  customTitle: "Something else in mind?",
  customLead:
    "Three hours, a proposal, a family reunion, a second photographer, a location that is not on this list — tell us the shape of the day and we will price it.",
  customCta: "Ask for a custom session",

  settingsTitle: "Where we shoot",
  settingsLead:
    "You pick the landscape. We pick the hour that makes it look like itself.",
  notStudioTitle: "This is not a studio shoot",
  notStudioLead:
    "There is no backdrop, no umbrella lighting and no rented set. We drive you to real places in Crete and photograph you in them, in daylight the island supplies for free.",
  addOnTitle: "Already booked a tour?",
  addOnLead:
    "A photographer can join selected day tours as an add-on, so the day you booked comes home as pictures as well as memories.",
  addOnCta: "See Crete tours",

  curriculumTitle: "What you learn, day by day",
  curriculumLead:
    "Locations shift with the weather, the season and the light. The teaching does not.",
  day: "Day",
  departuresTitle: "Seasonal departures",
  departuresLead:
    "The workshop runs in the seasons when Crete photographs best — spring green, autumn gold and the first dramatic light of winter.",
  statusConfirmed: "Departure confirmed",
  statusForming: "Group forming",
  statusLimited: "Limited availability",
  limitedNote:
    "Early December departures depend on the minimum group and on workable weather. We confirm or refund — we do not run a half-empty workshop in the rain.",
  requestToJoin: "Request to join",
  bookDeparture: "Book this departure",
  spotsLeft: "{n} places left",
  groupSize: "Group size",
  groupNote:
    "Runs with {min} to {max} participants. A departure is confirmed the moment {min} people have joined, and you are told either way before anything is paid.",
  datesTba: "Exact dates confirmed on departure",
  gearTitle: "Bring the camera you own",
  gearLead:
    "No professional experience and no professional kit required. If it takes pictures, we can teach you to take better ones with it.",
  gearDslr: "DSLR",
  gearMirrorless: "Mirrorless",
  gearCompact: "Compact",
  gearSmartphone: "Smartphone",
  levelTitle: "Built for beginners",
  levelLead:
    "This is a workshop for people who own a camera and want to understand it — not a masterclass for working photographers.",
  earlyBird: "Early-bird launch price",
  standardPrice: "Standard price",
  seasonsTitle: "The three editions",

  formExperienceTitle: "Request this shoot",
  formWorkshopTitle: "Request to join",
  formLead:
    "Tell us the date and what you are after. We reply with availability and a written confirmation.",
  formPackage: "Package",
  formDeparture: "Preferred departure",
  formCustom: "Custom / private",
  formNoPayment:
    "No payment is taken here. We confirm availability first, then send a payment link.",
  formSend: "Send request",
};

const DE: PhotographyUI = {
  nav: "Fotografie",
  experienceNav: "Foto-Erlebnis",
  workshopNav: "Mehrtägige Fotografie",
  experienceChips: ["1–4 Stunden", "Halbtags", "Ganztags", "Individuell / privat"],
  workshopChips: ["Für Einsteiger", "Kleine Gruppe", "Saisonale Termine"],

  hubSeoTitle: "Fotografie auf Kreta | Fotoshootings & 4-Tage-Workshops",
  hubSeoDesc:
    "Zwei Wege mit einem Fotografen auf Kreta: ein Outdoor-Shooting von Ihnen in den Landschaften der Insel, oder ein viertägiger Einsteiger-Workshop, in dem Sie selbst fotografieren lernen.",
  hubKicker: "Fotografie auf Kreta",
  hubTitle: "Kreta sehen. Kreta spüren. Kreta fotografieren.",
  hubLead:
    "Strände, Berge, Altstadtgassen und Olivenhaine — und ein Fotograf, der weiß, wo das Licht hinfällt. Lassen Sie Ihre Tage fotografieren, oder verbringen Sie vier davon damit, es selbst zu lernen.",
  hubCtaExperience: "Fotoshooting buchen",
  hubCtaWorkshop: "Workshop mitmachen",
  differenceTitle: "Zwei verschiedene Dinge — mit Absicht",
  differenceLead:
    "Das eine stellt Sie vor die Kamera. Das andere gibt Ihnen die Kamera in die Hand. Wählen Sie, was Sie wirklich wollen — es sind keine Varianten voneinander.",
  weShootYou: "Wir fotografieren Sie",
  youLearn: "Sie lernen fotografieren",
  viewDetails: "Details ansehen",

  experienceKicker: "Foto-Erlebnis",
  experienceTitle: "Professionelle Fotos von Ihnen, draußen auf Kreta",
  experienceLead:
    "Ein Fotograf begleitet Sie eine Stunde oder einen ganzen Tag, bringt Sie an die Orte, die zum Licht passen, und liefert eine Galerie natürlicher Porträts — kein Studio, kein Posier-Drehbuch.",
  experienceSeoTitle: "Fotoshooting auf Kreta | Foto-Erlebnis ab Rethymno",
  experienceSeoDesc:
    "Professionelles Outdoor-Fotoshooting auf Kreta buchen: Strände, Dörfer, Schluchten und Goldene Stunde. Sessions von einer Stunde bis ganztags, ab 160 €, mit Online-Galerie.",
  workshopKicker: "Mehrtägige Fotografie",
  workshopTitle: "Sie besuchen Kreta nicht nur. Sie lernen, es zu fotografieren.",
  workshopLead:
    "Foto-Auszeiten in kleiner Gruppe für Einsteiger und Enthusiasten. Vier Tage Landschaften, Dörfer und Licht, mit professionellem Dozenten und der Kamera, die Sie schon besitzen.",
  workshopSeoTitle: "Fotoworkshops auf Kreta | 4-Tage-Kurs für Einsteiger",
  workshopSeoDesc:
    "Viertägiger Foto-Workshop für Einsteiger auf Kreta. Kleine Gruppen von vier bis sechs, tägliche Lektionen, Sonnenauf- und -untergang, DSLR, spiegellos, Kompakt oder Smartphone.",

  packagesTitle: "Wählen Sie Ihre Session",
  packagesLead:
    "Jedes Paket ist ein echtes Shooting mit einem echten Fotografen, geliefert als private Online-Galerie.",
  mostPopular: "Am beliebtesten",
  upToPeople: "Bis zu {n} Personen",
  locationOne: "1 Location",
  locationsN: "{n} Locations",
  locationsRange: "{min}–{max} Locations",
  photosRange: "{min}–{max} professionell bearbeitete Fotos",
  photosPlus: "{n}+ professionell bearbeitete Fotos",
  qualityTitle: "Qualität statt Menge",
  qualityLead:
    "Die Zahlen oben sind Bilder, die wir ausgewählt, farbkorrigiert und retuschiert haben — nicht alles, was der Auslöser erwischt hat. Ein kleinerer Satz Bilder, den Sie wirklich nutzen, schlägt tausend, die Sie nie öffnen.",
  transportIncluded: "Privater Transport zwischen den Locations",
  goldenHourOption: "Goldene Stunde, wenn das Licht mitspielt",
  customTitle: "Etwas anderes im Sinn?",
  customLead:
    "Drei Stunden, ein Heiratsantrag, ein Familientreffen, ein zweiter Fotograf, ein Ort, der hier nicht steht — sagen Sie uns, wie der Tag aussehen soll, und wir kalkulieren ihn.",
  customCta: "Individuelle Session anfragen",

  settingsTitle: "Wo wir fotografieren",
  settingsLead:
    "Sie wählen die Landschaft. Wir wählen die Stunde, in der sie nach sich selbst aussieht.",
  notStudioTitle: "Das ist kein Studio-Shooting",
  notStudioLead:
    "Kein Hintergrund, kein Schirmlicht, kein gemietetes Set. Wir fahren Sie an echte Orte auf Kreta und fotografieren Sie dort, im Tageslicht, das die Insel gratis liefert.",
  addOnTitle: "Schon eine Tour gebucht?",
  addOnLead:
    "Ein Fotograf kann ausgewählte Tagestouren als Zusatzleistung begleiten — so kommt der gebuchte Tag auch als Bilder nach Hause, nicht nur als Erinnerung.",
  addOnCta: "Kreta-Touren ansehen",

  curriculumTitle: "Was Sie lernen, Tag für Tag",
  curriculumLead:
    "Die Orte verschieben sich mit Wetter, Jahreszeit und Licht. Der Unterricht nicht.",
  day: "Tag",
  departuresTitle: "Saisonale Termine",
  departuresLead:
    "Der Workshop läuft in den Jahreszeiten, in denen Kreta am besten aussieht — Frühlingsgrün, Herbstgold und das erste dramatische Winterlicht.",
  statusConfirmed: "Termin bestätigt",
  statusForming: "Gruppe bildet sich",
  statusLimited: "Begrenzte Verfügbarkeit",
  limitedNote:
    "Termine Anfang Dezember hängen von der Mindestgruppe und von brauchbarem Wetter ab. Wir bestätigen oder erstatten — wir führen keinen halbleeren Workshop im Regen durch.",
  requestToJoin: "Teilnahme anfragen",
  bookDeparture: "Diesen Termin buchen",
  spotsLeft: "Noch {n} Plätze",
  groupSize: "Gruppengröße",
  groupNote:
    "Läuft mit {min} bis {max} Teilnehmenden. Ein Termin gilt als bestätigt, sobald {min} Personen zugesagt haben — und Sie erfahren es so oder so, bevor irgendetwas bezahlt wird.",
  datesTba: "Genaue Daten bei Bestätigung",
  gearTitle: "Bringen Sie die Kamera mit, die Sie haben",
  gearLead:
    "Keine Profi-Erfahrung und keine Profi-Ausrüstung nötig. Wenn sie Bilder macht, bringen wir Ihnen bei, damit bessere zu machen.",
  gearDslr: "DSLR",
  gearMirrorless: "Spiegellos",
  gearCompact: "Kompakt",
  gearSmartphone: "Smartphone",
  levelTitle: "Für Einsteiger gemacht",
  levelLead:
    "Ein Workshop für Menschen, die eine Kamera besitzen und sie verstehen wollen — keine Meisterklasse für Berufsfotografen.",
  earlyBird: "Frühbucher-Startpreis",
  standardPrice: "Regulärer Preis",
  seasonsTitle: "Die drei Editionen",

  formExperienceTitle: "Dieses Shooting anfragen",
  formWorkshopTitle: "Teilnahme anfragen",
  formLead:
    "Sagen Sie uns Datum und Wunsch. Wir antworten mit Verfügbarkeit und schriftlicher Bestätigung.",
  formPackage: "Paket",
  formDeparture: "Wunschtermin",
  formCustom: "Individuell / privat",
  formNoPayment:
    "Hier wird nichts abgebucht. Wir bestätigen zuerst die Verfügbarkeit und senden dann einen Zahlungslink.",
  formSend: "Anfrage senden",
};

const IT: PhotographyUI = {
  nav: "Fotografia",
  experienceNav: "Esperienza fotografica",
  workshopNav: "Fotografia di più giorni",
  experienceChips: ["1–4 ore", "Mezza giornata", "Giornata intera", "Su misura / privato"],
  workshopChips: ["Adatto ai principianti", "Piccolo gruppo", "Partenze stagionali"],

  hubSeoTitle: "Fotografia a Creta | Servizi fotografici e workshop di 4 giorni",
  hubSeoDesc:
    "Due modi di lavorare con un fotografo a Creta: un servizio all'aperto che ritrae voi nei paesaggi dell'isola, o un workshop di quattro giorni per principianti in cui imparate a fotografarla.",
  hubKicker: "Fotografia a Creta",
  hubTitle: "Vedere Creta. Sentire Creta. Fotografare Creta.",
  hubLead:
    "Spiagge, montagne, centri storici e uliveti — e un fotografo che sa dove cade la luce. Fatevi fotografare le giornate, oppure passatene quattro a imparare a farlo voi.",
  hubCtaExperience: "Prenota un servizio",
  hubCtaWorkshop: "Partecipa al workshop",
  differenceTitle: "Due cose diverse, di proposito",
  differenceLead:
    "Una vi mette davanti all'obiettivo. L'altra vi mette l'obiettivo in mano. Scegliete quella che volete davvero: non sono due versioni della stessa cosa.",
  weShootYou: "Fotografiamo voi",
  youLearn: "Imparate a fotografare",
  viewDetails: "Vedi i dettagli",

  experienceKicker: "Esperienza fotografica",
  experienceTitle: "Foto professionali di voi, all'aperto a Creta",
  experienceLead:
    "Un fotografo vi accompagna per un'ora o per un giorno intero, vi porta nei luoghi giusti per la luce e vi consegna una galleria di ritratti naturali — niente studio, niente pose a comando.",
  experienceSeoTitle: "Servizio fotografico a Creta | Esperienza da Rethymno",
  experienceSeoDesc:
    "Prenota un servizio fotografico all'aperto a Creta: spiagge, villaggi, gole e Golden Hour. Sessioni da un'ora a una giornata intera, da 160 €, con galleria online.",
  workshopKicker: "Fotografia di più giorni",
  workshopTitle: "Non visitate soltanto Creta. Imparate a fotografarla.",
  workshopLead:
    "Ritiri fotografici in piccolo gruppo per principianti e appassionati. Quattro giorni di paesaggi, villaggi e luce, con un istruttore professionista e la macchina che avete già.",
  workshopSeoTitle: "Workshop di fotografia a Creta | 4 giorni per principianti",
  workshopSeoDesc:
    "Workshop fotografico di quattro giorni per principianti a Creta. Gruppi di quattro-sei persone, lezioni quotidiane, alba e tramonto, reflex, mirrorless, compatta o smartphone.",

  packagesTitle: "Scegliete la vostra sessione",
  packagesLead:
    "Ogni pacchetto è un servizio vero con un fotografo vero, consegnato come galleria online privata.",
  mostPopular: "Il più richiesto",
  upToPeople: "Fino a {n} persone",
  locationOne: "1 location",
  locationsN: "{n} location",
  locationsRange: "{min}–{max} location",
  photosRange: "{min}–{max} foto elaborate professionalmente",
  photosPlus: "{n}+ foto elaborate professionalmente",
  qualityTitle: "Qualità, non quantità",
  qualityLead:
    "I numeri qui sopra sono immagini che abbiamo selezionato, corretto nel colore e ritoccato — non tutto ciò che ha catturato l'otturatore. Poche foto che userete davvero valgono più di mille che non aprirete mai.",
  transportIncluded: "Trasporto privato tra le location",
  goldenHourOption: "Sessione in Golden Hour quando la luce lo permette",
  customTitle: "Avete in mente altro?",
  customLead:
    "Tre ore, una proposta di matrimonio, una riunione di famiglia, un secondo fotografo, un luogo che non è in elenco — raccontateci la giornata e la quotiamo.",
  customCta: "Richiedi una sessione su misura",

  settingsTitle: "Dove fotografiamo",
  settingsLead: "Voi scegliete il paesaggio. Noi scegliamo l'ora in cui somiglia a se stesso.",
  notStudioTitle: "Non è un servizio in studio",
  notStudioLead:
    "Nessun fondale, nessun ombrello, nessun set in affitto. Vi portiamo in luoghi veri di Creta e vi fotografiamo lì, nella luce del giorno che l'isola offre gratis.",
  addOnTitle: "Avete già prenotato un tour?",
  addOnLead:
    "Un fotografo può unirsi ad alcuni tour giornalieri come servizio extra, così la giornata prenotata torna a casa anche in immagini.",
  addOnCta: "Vedi i tour di Creta",

  curriculumTitle: "Cosa imparate, giorno per giorno",
  curriculumLead:
    "I luoghi cambiano con il meteo, la stagione e la luce. L'insegnamento no.",
  day: "Giorno",
  departuresTitle: "Partenze stagionali",
  departuresLead:
    "Il workshop si svolge nelle stagioni in cui Creta si fotografa meglio: il verde di primavera, l'oro d'autunno e la prima luce drammatica dell'inverno.",
  statusConfirmed: "Partenza confermata",
  statusForming: "Gruppo in formazione",
  statusLimited: "Disponibilità limitata",
  limitedNote:
    "Le partenze di inizio dicembre dipendono dal gruppo minimo e da un meteo praticabile. Confermiamo o rimborsiamo: non facciamo un workshop mezzo vuoto sotto la pioggia.",
  requestToJoin: "Richiedi di partecipare",
  bookDeparture: "Prenota questa partenza",
  spotsLeft: "{n} posti rimasti",
  groupSize: "Dimensione del gruppo",
  groupNote:
    "Si svolge con {min}-{max} partecipanti. Una partenza è confermata nel momento in cui {min} persone hanno aderito, e in ogni caso lo saprete prima di pagare qualsiasi cosa.",
  datesTba: "Date esatte alla conferma",
  gearTitle: "Portate la macchina che avete",
  gearLead:
    "Nessuna esperienza professionale e nessuna attrezzatura professionale richiesta. Se scatta foto, possiamo insegnarvi a farne di migliori.",
  gearDslr: "Reflex",
  gearMirrorless: "Mirrorless",
  gearCompact: "Compatta",
  gearSmartphone: "Smartphone",
  levelTitle: "Pensato per principianti",
  levelLead:
    "Un workshop per chi possiede una macchina fotografica e vuole capirla — non una masterclass per professionisti.",
  earlyBird: "Prezzo lancio early bird",
  standardPrice: "Prezzo standard",
  seasonsTitle: "Le tre edizioni",

  formExperienceTitle: "Richiedi questo servizio",
  formWorkshopTitle: "Richiedi di partecipare",
  formLead:
    "Diteci la data e cosa desiderate. Rispondiamo con la disponibilità e una conferma scritta.",
  formPackage: "Pacchetto",
  formDeparture: "Partenza preferita",
  formCustom: "Su misura / privato",
  formNoPayment:
    "Qui non viene addebitato nulla. Confermiamo prima la disponibilità, poi inviamo un link di pagamento.",
  formSend: "Invia richiesta",
};

const FR: PhotographyUI = {
  nav: "Photographie",
  experienceNav: "Expérience photo",
  workshopNav: "Photographie sur plusieurs jours",
  experienceChips: ["1–4 heures", "Demi-journée", "Journée entière", "Sur mesure / privé"],
  workshopChips: ["Accessible aux débutants", "Petit groupe", "Départs saisonniers"],

  hubSeoTitle: "Photographie en Crète | Séances photo et stages de 4 jours",
  hubSeoDesc:
    "Deux façons de travailler avec un photographe en Crète : une séance en extérieur où vous êtes photographié dans les paysages de l'île, ou un stage débutant de quatre jours.",
  hubKicker: "Photographie en Crète",
  hubTitle: "Voir la Crète. Sentir la Crète. Photographier la Crète.",
  hubLead:
    "Plages, montagnes, vieilles villes et oliveraies — et un photographe qui sait où tombe la lumière. Faites photographier vos journées, ou passez-en quatre à apprendre à le faire vous-même.",
  hubCtaExperience: "Réserver une séance",
  hubCtaWorkshop: "Rejoindre un stage",
  differenceTitle: "Deux choses différentes, volontairement",
  differenceLead:
    "L'une vous place devant l'objectif. L'autre vous met l'appareil entre les mains. Choisissez celle que vous voulez vraiment : ce ne sont pas deux versions de la même chose.",
  weShootYou: "Nous vous photographions",
  youLearn: "Vous apprenez à photographier",
  viewDetails: "Voir les détails",

  experienceKicker: "Expérience photo",
  experienceTitle: "Des photos professionnelles de vous, en Crète",
  experienceLead:
    "Un photographe vous accompagne une heure ou une journée entière, vous emmène là où la lumière est juste, et vous remet une galerie de portraits naturels — sans studio, sans poses dictées.",
  experienceSeoTitle: "Séance photo en Crète | Expérience photo depuis Rethymno",
  experienceSeoDesc:
    "Réservez une séance photo en extérieur en Crète : plages, villages, gorges et Golden Hour. Séances d'une heure à une journée, à partir de 160 €, avec galerie en ligne.",
  workshopKicker: "Photographie sur plusieurs jours",
  workshopTitle: "Vous ne visitez pas seulement la Crète. Vous apprenez à la photographier.",
  workshopLead:
    "Des escapades photo en petit groupe pour débutants et passionnés. Quatre jours de paysages, de villages et de lumière, avec un formateur professionnel et l'appareil que vous possédez déjà.",
  workshopSeoTitle: "Stages photo en Crète | Escapade débutant de 4 jours",
  workshopSeoDesc:
    "Stage photo de quatre jours pour débutants en Crète. Petits groupes de quatre à six, cours quotidiens, levers et couchers de soleil, reflex, hybride, compact ou smartphone.",

  packagesTitle: "Choisissez votre séance",
  packagesLead:
    "Chaque formule est une vraie séance avec un vrai photographe, livrée sous forme de galerie en ligne privée.",
  mostPopular: "Le plus demandé",
  upToPeople: "Jusqu'à {n} personnes",
  locationOne: "1 lieu",
  locationsN: "{n} lieux",
  locationsRange: "{min}–{max} lieux",
  photosRange: "{min}–{max} photos retouchées professionnellement",
  photosPlus: "{n}+ photos retouchées professionnellement",
  qualityTitle: "La qualité, pas la quantité",
  qualityLead:
    "Les chiffres ci-dessus sont des images que nous avons sélectionnées, étalonnées et retouchées — pas tout ce que l'obturateur a saisi. Quelques photos que vous utiliserez valent mieux qu'un millier que vous n'ouvrirez jamais.",
  transportIncluded: "Transport privé entre les lieux",
  goldenHourOption: "Séance Golden Hour lorsque la lumière le permet",
  customTitle: "Autre chose en tête ?",
  customLead:
    "Trois heures, une demande en mariage, une réunion de famille, un second photographe, un lieu absent de cette liste — décrivez-nous la journée et nous la chiffrons.",
  customCta: "Demander une séance sur mesure",

  settingsTitle: "Où nous photographions",
  settingsLead:
    "Vous choisissez le paysage. Nous choisissons l'heure où il ressemble à lui-même.",
  notStudioTitle: "Ce n'est pas une séance en studio",
  notStudioLead:
    "Pas de fond, pas de parapluie, pas de décor loué. Nous vous conduisons dans de vrais lieux de Crète et vous y photographions, dans la lumière du jour que l'île fournit gratuitement.",
  addOnTitle: "Déjà réservé un circuit ?",
  addOnLead:
    "Un photographe peut accompagner certaines excursions en option, pour que la journée réservée rentre aussi en images.",
  addOnCta: "Voir les circuits en Crète",

  curriculumTitle: "Ce que vous apprenez, jour après jour",
  curriculumLead:
    "Les lieux changent avec la météo, la saison et la lumière. L'enseignement, non.",
  day: "Jour",
  departuresTitle: "Départs saisonniers",
  departuresLead:
    "Le stage a lieu aux saisons où la Crète se photographie le mieux : le vert du printemps, l'or de l'automne et la première lumière dramatique de l'hiver.",
  statusConfirmed: "Départ confirmé",
  statusForming: "Groupe en formation",
  statusLimited: "Disponibilité limitée",
  limitedNote:
    "Les départs de début décembre dépendent du groupe minimum et d'une météo praticable. Nous confirmons ou remboursons : pas de stage à moitié vide sous la pluie.",
  requestToJoin: "Demander à participer",
  bookDeparture: "Réserver ce départ",
  spotsLeft: "{n} places restantes",
  groupSize: "Taille du groupe",
  groupNote:
    "Se déroule avec {min} à {max} participants. Un départ est confirmé dès que {min} personnes ont rejoint, et vous êtes prévenu dans un sens ou dans l'autre avant tout paiement.",
  datesTba: "Dates exactes à la confirmation",
  gearTitle: "Venez avec l'appareil que vous avez",
  gearLead:
    "Aucune expérience ni matériel professionnel requis. Si l'appareil prend des photos, nous pouvons vous apprendre à en faire de meilleures.",
  gearDslr: "Reflex",
  gearMirrorless: "Hybride",
  gearCompact: "Compact",
  gearSmartphone: "Smartphone",
  levelTitle: "Conçu pour les débutants",
  levelLead:
    "Un stage pour celles et ceux qui possèdent un appareil et veulent le comprendre — pas une masterclass pour photographes professionnels.",
  earlyBird: "Tarif de lancement early bird",
  standardPrice: "Tarif standard",
  seasonsTitle: "Les trois éditions",

  formExperienceTitle: "Demander cette séance",
  formWorkshopTitle: "Demander à participer",
  formLead:
    "Indiquez-nous la date et ce que vous souhaitez. Nous répondons avec les disponibilités et une confirmation écrite.",
  formPackage: "Formule",
  formDeparture: "Départ souhaité",
  formCustom: "Sur mesure / privé",
  formNoPayment:
    "Aucun paiement n'est prélevé ici. Nous confirmons d'abord la disponibilité, puis envoyons un lien de paiement.",
  formSend: "Envoyer la demande",
};

const SV: PhotographyUI = {
  nav: "Fotografi",
  experienceNav: "Fotoupplevelse",
  workshopNav: "Fotografi över flera dagar",
  experienceChips: ["1–4 timmar", "Halvdag", "Heldag", "Skräddarsytt / privat"],
  workshopChips: ["Nybörjarvänligt", "Liten grupp", "Säsongsavgångar"],

  hubSeoTitle: "Fotografi på Kreta | Fotografering och 4-dagars workshops",
  hubSeoDesc:
    "Två sätt att arbeta med en fotograf på Kreta: en utomhusfotografering där ni porträtteras i öns landskap, eller en fyra dagars nybörjarworkshop där ni lär er fotografera själva.",
  hubKicker: "Fotografi på Kreta",
  hubTitle: "Se Kreta. Känn Kreta. Fotografera Kreta.",
  hubLead:
    "Stränder, berg, gamla stan och olivlundar — och en fotograf som vet var ljuset faller. Låt era dagar bli fotograferade, eller ägna fyra av dem åt att lära er göra det själva.",
  hubCtaExperience: "Boka fotografering",
  hubCtaWorkshop: "Gå med i en workshop",
  differenceTitle: "Två olika saker, med avsikt",
  differenceLead:
    "Den ena sätter er framför kameran. Den andra sätter kameran i era händer. Välj den ni faktiskt vill ha — de är inte varianter av varandra.",
  weShootYou: "Vi fotograferar er",
  youLearn: "Ni lär er fotografera",
  viewDetails: "Se detaljer",

  experienceKicker: "Fotoupplevelse",
  experienceTitle: "Professionella bilder på er, ute på Kreta",
  experienceLead:
    "En fotograf följer med er i en timme eller en hel dag, tar er till platserna som passar ljuset och lämnar tillbaka ett galleri med naturliga porträtt — ingen studio, inget posningsmanus.",
  experienceSeoTitle: "Fotografering på Kreta | Fotoupplevelse från Rethymno",
  experienceSeoDesc:
    "Boka en professionell utomhusfotografering på Kreta: stränder, byar, raviner och Golden Hour. Pass från en timme till en heldag, från 160 €, med onlinegalleri.",
  workshopKicker: "Fotografi över flera dagar",
  workshopTitle: "Ni besöker inte bara Kreta. Ni lär er fotografera det.",
  workshopLead:
    "Fotoresor i liten grupp för nybörjare och entusiaster. Fyra dagar med landskap, byar och ljus, med en professionell instruktör och den kamera ni redan äger.",
  workshopSeoTitle: "Fotoworkshops på Kreta | 4 dagar för nybörjare",
  workshopSeoDesc:
    "Fyra dagars fotoworkshop för nybörjare på Kreta. Små grupper om fyra till sex, dagliga lektioner, soluppgång och solnedgång, DSLR, spegellös, kompakt eller smartphone.",

  packagesTitle: "Välj ert pass",
  packagesLead:
    "Varje paket är en riktig fotografering med en riktig fotograf, levererad som ett privat onlinegalleri.",
  mostPopular: "Mest bokat",
  upToPeople: "Upp till {n} personer",
  locationOne: "1 plats",
  locationsN: "{n} platser",
  locationsRange: "{min}–{max} platser",
  photosRange: "{min}–{max} professionellt redigerade bilder",
  photosPlus: "{n}+ professionellt redigerade bilder",
  qualityTitle: "Kvalitet, inte kvantitet",
  qualityLead:
    "Siffrorna ovan är bilder vi har valt ut, färgsatt och retuscherat — inte allt slutaren fångade. Ett mindre antal bilder ni faktiskt använder slår tusen ni aldrig öppnar.",
  transportIncluded: "Privat transport mellan platserna",
  goldenHourOption: "Golden Hour-pass när ljuset tillåter",
  customTitle: "Något annat i tankarna?",
  customLead:
    "Tre timmar, ett frieri, en släktträff, en andra fotograf, en plats som inte står här — beskriv dagen så prissätter vi den.",
  customCta: "Fråga om ett skräddarsytt pass",

  settingsTitle: "Var vi fotograferar",
  settingsLead: "Ni väljer landskapet. Vi väljer timmen då det ser ut som sig självt.",
  notStudioTitle: "Detta är ingen studiofotografering",
  notStudioLead:
    "Ingen fond, ingen paraplybelysning, ingen hyrd studio. Vi kör er till riktiga platser på Kreta och fotograferar er där, i dagsljuset som ön bjuder på gratis.",
  addOnTitle: "Redan bokat en tur?",
  addOnLead:
    "En fotograf kan följa med på utvalda dagsturer som tillval, så att den bokade dagen kommer hem som bilder också.",
  addOnCta: "Se Kretaturer",

  curriculumTitle: "Vad ni lär er, dag för dag",
  curriculumLead: "Platserna skiftar med väder, säsong och ljus. Undervisningen gör det inte.",
  day: "Dag",
  departuresTitle: "Säsongsavgångar",
  departuresLead:
    "Workshopen körs under de säsonger då Kreta fotograferar sig bäst — vårens grönska, höstens guld och vinterns första dramatiska ljus.",
  statusConfirmed: "Avgång bekräftad",
  statusForming: "Grupp bildas",
  statusLimited: "Begränsad tillgång",
  limitedNote:
    "Avgångar i början av december beror på minimigruppen och på användbart väder. Vi bekräftar eller återbetalar — vi kör ingen halvtom workshop i regn.",
  requestToJoin: "Ansök om plats",
  bookDeparture: "Boka denna avgång",
  spotsLeft: "{n} platser kvar",
  groupSize: "Gruppstorlek",
  groupNote:
    "Körs med {min} till {max} deltagare. En avgång bekräftas så snart {min} personer har anslutit, och ni får besked åt endera hållet innan något betalas.",
  datesTba: "Exakta datum vid bekräftelse",
  gearTitle: "Ta med kameran ni har",
  gearLead:
    "Ingen professionell erfarenhet och ingen proffsutrustning krävs. Tar den bilder kan vi lära er ta bättre med den.",
  gearDslr: "DSLR",
  gearMirrorless: "Spegellös",
  gearCompact: "Kompakt",
  gearSmartphone: "Smartphone",
  levelTitle: "Byggd för nybörjare",
  levelLead:
    "En workshop för er som äger en kamera och vill förstå den — inte en masterclass för yrkesfotografer.",
  earlyBird: "Early bird-lanseringspris",
  standardPrice: "Ordinarie pris",
  seasonsTitle: "De tre utgåvorna",

  formExperienceTitle: "Fråga om denna fotografering",
  formWorkshopTitle: "Ansök om plats",
  formLead:
    "Berätta datum och vad ni önskar. Vi svarar med tillgänglighet och en skriftlig bekräftelse.",
  formPackage: "Paket",
  formDeparture: "Önskad avgång",
  formCustom: "Skräddarsytt / privat",
  formNoPayment:
    "Ingen betalning sker här. Vi bekräftar tillgängligheten först och skickar sedan en betallänk.",
  formSend: "Skicka förfrågan",
};

const COPY: Record<Lang, PhotographyUI> = { en: EN, de: DE, it: IT, fr: FR, sv: SV };

export function photographyCopy(lang: Lang): PhotographyUI {
  return COPY[lang] ?? EN;
}
