export const LOCALES = ["en", "es", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
};

export const HREFLANG: Record<Locale, string> = {
  en: "en-US",
  es: "es",
  de: "de-DE",
};

export const OGLOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
};
