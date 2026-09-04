export const LANGS = ["en", "de", "it", "fr", "sv"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

/** For path parsers and Next redirect matchers. */
export const LANG_PATTERN = LANGS.join("|");
export const LANG_PATH_RE = new RegExp(`^/(${LANG_PATTERN})`);

export const LANG_META: Record<
  Lang,
  { label: string; native: string; locale: string; hreflang: string; dateLocale: string }
> = {
  en: { label: "English", native: "English", locale: "en_US", hreflang: "en", dateLocale: "en-GB" },
  de: { label: "German", native: "Deutsch", locale: "de_DE", hreflang: "de", dateLocale: "de-DE" },
  it: { label: "Italian", native: "Italiano", locale: "it_IT", hreflang: "it", dateLocale: "it-IT" },
  fr: { label: "French", native: "Français", locale: "fr_FR", hreflang: "fr", dateLocale: "fr-FR" },
  sv: { label: "Swedish", native: "Svenska", locale: "sv_SE", hreflang: "sv", dateLocale: "sv-SE" },
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

/** `{name}` / `{n}` style templates used by UI strings. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) =>
    vars[key] == null ? "" : String(vars[key]),
  );
}
