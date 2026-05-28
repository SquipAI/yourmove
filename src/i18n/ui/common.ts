import type { Locale } from "../config";

export const common = {
  en: {
    "common.rights": "All Rights Reserved",
    "common.readMore": "Read more",
    "nav.allTools": "All tools",
  },
  es: {
    "common.rights": "Todos los derechos reservados",
    "common.readMore": "Leer más",
    "nav.allTools": "Más herramientas",
  },
  de: {
    "common.rights": "Alle Rechte vorbehalten",
    "common.readMore": "Mehr lesen",
    "nav.allTools": "Alle Tools",
  },
} satisfies Record<Locale, Record<string, string>>;
