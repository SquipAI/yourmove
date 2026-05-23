import { LOCALES } from "./config";
import type { Locale } from "./config";
import { common } from "./ui/common";
import { blog } from "./ui/blog";
import { tools } from "./ui/tools";

type AllKeys =
  | keyof (typeof common)["en"]
  | keyof (typeof blog)["en"]
  | keyof (typeof tools)["en"];

const ui = Object.fromEntries(
  LOCALES.map((lang) => [
    lang,
    { ...common[lang], ...blog[lang], ...tools[lang] },
  ]),
) as Record<Locale, Record<AllKeys, string>>;

export function t(lang: Locale, key: AllKeys): string {
  return ui[lang][key] ?? ui["en"][key];
}
