import type { Locale } from "../config";

export const reviews = {
  en: {
    "reviews.heading": "What our users say",
    "reviews.seeAll": "See all reviews",
  },
  es: {
    "reviews.heading": "Lo que dicen nuestros usuarios",
    "reviews.seeAll": "Ver todas las reseñas",
  },
  de: {
    "reviews.heading": "Was unsere Nutzer sagen",
    "reviews.seeAll": "Alle Bewertungen ansehen",
  },
} satisfies Record<Locale, Record<string, string>>;
