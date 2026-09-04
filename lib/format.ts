import { LANG_META, type Lang } from "./i18n/langs";

export function formatPrice(lang: Lang, amount: number) {
  return new Intl.NumberFormat(LANG_META[lang].dateLocale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
