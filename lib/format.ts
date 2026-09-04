import type { Lang } from "./i18n/langs";

export function formatPrice(lang: Lang, amount: number) {
  const locales: Record<Lang, string> = {
    en: "en-GB",
    el: "el-GR",
    de: "de-DE",
    it: "it-IT",
    fr: "fr-FR",
    sv: "sv-SE",
  };
  return new Intl.NumberFormat(locales[lang], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
