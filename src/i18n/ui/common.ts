import type { Locale } from "../config";

export const common = {
  en: {
    "common.rights": "All Rights Reserved",
    "common.readMore": "Read more",
  },
  es: {
    "common.rights": "Todos los derechos reservados",
    "common.readMore": "Leer más",
  },
  de: {
    "common.rights": "Alle Rechte vorbehalten",
    "common.readMore": "Mehr lesen",
  },
} satisfies Record<Locale, Record<string, string>>;
