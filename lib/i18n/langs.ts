export const LANGS = ["en", "el", "de", "it", "fr", "sv"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

export const LANG_META: Record<
  Lang,
  { label: string; native: string; locale: string; hreflang: string }
> = {
  en: { label: "English", native: "English", locale: "en_US", hreflang: "en" },
  el: { label: "Greek", native: "Ελληνικά", locale: "el_GR", hreflang: "el" },
  de: { label: "German", native: "Deutsch", locale: "de_DE", hreflang: "de" },
  it: { label: "Italian", native: "Italiano", locale: "it_IT", hreflang: "it" },
  fr: { label: "French", native: "Français", locale: "fr_FR", hreflang: "fr" },
  sv: { label: "Swedish", native: "Svenska", locale: "sv_SE", hreflang: "sv" },
};

export function isLang(value: string | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value);
}

export function parseLang(value: string | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

export function langPath(lang: Lang, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${lang}`;
  return `/${lang}${clean}`;
}
