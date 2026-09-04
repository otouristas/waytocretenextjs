import type { Lang } from "@/lib/i18n/langs";
import { t } from "@/lib/i18n/ui";
import type { Tour } from "@/lib/tours";
import { formatPrice } from "@/lib/format";

export function priceLabel(lang: Lang, tour: Tour) {
  const copy = t(lang);
  if (tour.priceFrom == null) return copy.onRequest;
  return `${copy.fromPrice} ${formatPrice(lang, tour.priceFrom)}`;
}

export function priceSuffix(lang: Lang, tour: Tour) {
  const copy = t(lang);
  if (tour.priceFrom == null) return "";
  return copy.priceKind[tour.priceType];
}
