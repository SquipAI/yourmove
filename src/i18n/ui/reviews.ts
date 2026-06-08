import type { Locale } from "../config";

export const reviews = {
  en: {
    "reviews.heading": "What our users say",
    "reviews.seeAll": "See all reviews",
    "reviews.readTheirReviews": "Read their reviews",
    "reviews.joinDaters":
      "Join {count} daters who turned matches into dates.",
    "reviews.readFullArticle": "Read full article",
  },
  es: {
    "reviews.heading": "Lo que dicen nuestros usuarios",
    "reviews.seeAll": "Ver todas las reseñas",
    "reviews.readTheirReviews": "Lee sus reseñas",
    "reviews.joinDaters":
      "Únete a {count} solteros que convirtieron matches en citas.",
    "reviews.readFullArticle": "Leer artículo",
  },
  de: {
    "reviews.heading": "Was unsere Nutzer sagen",
    "reviews.seeAll": "Alle Bewertungen ansehen",
    "reviews.readTheirReviews": "Bewertungen lesen",
    "reviews.joinDaters":
      "Schließe dich {count} Singles an, die aus Matches Dates gemacht haben.",
    "reviews.readFullArticle": "Ganzen Artikel lesen",
  },
} satisfies Record<Locale, Record<string, string>>;
