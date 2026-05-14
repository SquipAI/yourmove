import { LOCALES } from "./config";
import type { Locale } from "./config";
import { common } from "./ui/common";
import { blog } from "./ui/blog";

type AllKeys = keyof (typeof common)["en"] | keyof (typeof blog)["en"];

const ui = Object.fromEntries(
  LOCALES.map((lang) => [lang, { ...common[lang], ...blog[lang] }])
) as Record<Locale, Record<AllKeys, string>>;

export function t(lang: Locale, key: AllKeys): string {
  return ui[lang][key] ?? ui["en"][key];
}
