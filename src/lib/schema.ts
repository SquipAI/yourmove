import type { Locale } from "@i18n/config";
import { stripAccent } from "./parseAccent";
import { urlFor } from "./sanity-image";
import type {
  FaqItem,
  Post,
  Press,
  ToolPageData,
  Testimonial,
  ReviewsPageData,
} from "./types";

const SITE = "https://yourmove.ai";
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

const KNOWS_ABOUT: Record<Locale, string[]> = {
  en: [
    "Online dating",
    "Dating apps",
    "Dating profile optimization",
    "Online dating openers and first messages",
    "Pickup lines",
    "Rizz",
    "Tinder",
    "Hinge",
    "Bumble",
  ],
  es: [
    "Citas online",
    "Apps de citas",
    "Ligar",
    "Mensajes para ligar",
    "Frases para ligar",
    "Optimización de perfil de citas",
    "Tinder",
    "Hinge",
    "Bumble",
  ],
  de: [
    "Online-Dating",
    "Dating-Apps",
    "Anmachsprüche",
    "Rizz Sprüche",
    "Hinge Prompts",
    "Dating-Opener",
    "Dating-Profil optimieren",
    "Tinder",
    "Hinge",
    "Bumble",
  ],
};

function orgNode(lang: Locale) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "YourMove AI",
    url: SITE,
    logo: `${SITE}/web-app-manifest-512x512.png`,
    knowsAbout: KNOWS_ABOUT[lang],
  };
}

const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE_ID,
  name: "YourMove AI",
  url: SITE,
  publisher: { "@id": ORG_ID },
};

const AUTHOR = {
  "@type": "Organization",
  name: "YourMove Team",
  url: SITE,
};

export type BreadcrumbItem = { name: string; url: string };

export function buildBreadcrumb(items: BreadcrumbItem[], id: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(items: FaqItem[], pageUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: portableTextToPlain(item.answer),
      },
    })),
  };
}

export function articleSchema(
  post: Post,
  url: string,
  lang: Locale,
  breadcrumbs: BreadcrumbItem[],
) {
  const article: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: stripAccent(post.title),
    url,
    inLanguage: lang,
    datePublished: post.createdAt,
    dateModified: post._updatedAt,
    author: AUTHOR,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    description: post.metaDescription,
    abstract: post.summary,
    keywords: post.tags.map((t) => t.title).join(", "),
    image: urlFor(post.mainImage).width(1200).height(630).fit("crop").url(),
  };

  const webpage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    inLanguage: lang,
    name: stripAccent(post.title),
    isPartOf: { "@id": SITE_ID },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    ...(post.metaDescription ? { description: post.metaDescription } : {}),
  };

  const graph: unknown[] = [
    orgNode(lang),
    WEBSITE,
    webpage,
    article,
    buildBreadcrumb(breadcrumbs, `${url}#breadcrumb`),
  ];

  if (post.faq?.length) {
    graph.push(faqPageSchema(post.faq, url));
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function toolSchema(
  tool: ToolPageData,
  testimonials: Testimonial[],
  url: string,
  lang: Locale,
  ogImage: string,
) {
  const graph: unknown[] = [orgNode(lang), WEBSITE];

  if (tool.faq?.length) {
    graph.push(faqPageSchema(tool.faq, url));
  }

  const app: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: tool.title.replace(/\*/g, ""),
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    publisher: { "@id": ORG_ID },
    image: ogImage,
    ...(tool.description ? { description: tool.description.replace(/\*/g, "") } : {}),
  };
  const aggregate = aggregateRatingNode(testimonials);
  if (aggregate) app.aggregateRating = aggregate;
  if (testimonials.length) app.review = testimonials.map(reviewNode);
  graph.push(app);

  graph.unshift({
    "@type": "WebPage",
    "@id": url,
    url,
    inLanguage: lang,
    name: tool.metaTitle,
    description: tool.metaDescription,
    isPartOf: { "@id": SITE_ID },
    image: ogImage,
  });

  return { "@context": "https://schema.org", "@graph": graph };
}

export function reviewsPageSchema(
  page: ReviewsPageData,
  testimonials: Testimonial[],
  pressQuotes: Press[],
  url: string,
  lang: Locale,
  breadcrumbs: BreadcrumbItem[],
  ogImage: string,
) {
  const reviews = testimonials.map(reviewNode);
  const aggregate = aggregateRatingNode(testimonials);

  const orgWithReviews: Record<string, unknown> = {
    ...orgNode(lang),
    ...(aggregate ? { aggregateRating: aggregate } : {}),
    review: reviews,
  };

  const graph: unknown[] = [
    orgWithReviews,
    WEBSITE,
    {
      "@type": "WebPage",
      "@id": url,
      url,
      inLanguage: lang,
      name: page.metaTitle,
      description: page.metaDescription,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": ORG_ID },
      image: ogImage,
    },
    buildBreadcrumb(breadcrumbs, `${url}#breadcrumb`),
    ...pressQuotes.map((p) => quotationNode(p, lang)),
  ];

  return { "@context": "https://schema.org", "@graph": graph };
}

// Home page: Organization with aggregateRating (no individual reviews — those
// live on /reviews to avoid duplicate-content signals). Optionally includes
// FAQPage when the home doc carries FAQ items.
export function homeSchema(
  testimonials: Testimonial[],
  pressQuotes: Press[],
  faq: FaqItem[],
  url: string,
  lang: Locale,
  pageName: string,
  pageDescription: string,
  ogImage: string,
) {
  const aggregate = aggregateRatingNode(testimonials);

  const orgWithRating: Record<string, unknown> = {
    ...orgNode(lang),
    ...(aggregate ? { aggregateRating: aggregate } : {}),
  };

  const graph: unknown[] = [
    orgWithRating,
    WEBSITE,
    {
      "@type": "WebPage",
      "@id": url,
      url,
      inLanguage: lang,
      name: pageName,
      description: pageDescription,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": ORG_ID },
      image: ogImage,
    },
    ...pressQuotes.map((p) => quotationNode(p, lang)),
  ];

  if (faq.length) graph.push(faqPageSchema(faq, url));

  return { "@context": "https://schema.org", "@graph": graph };
}

function quotationNode(p: Press, lang: Locale) {
  const node: Record<string, unknown> = {
    "@type": "Quotation",
    "@id": `${SITE}/#quote-${p._id}`,
    inLanguage: lang,
    text: p.quote,
    creator: {
      "@type": "Organization",
      name: p.name,
      ...(p.logoUrl ? { logo: p.logoUrl } : {}),
    },
    about: { "@id": ORG_ID },
  };
  if (p.citationUrl) node.citation = p.citationUrl;
  return node;
}

function reviewNode(t: Testimonial) {
  const node: Record<string, unknown> = {
    "@type": "Review",
    author: { "@type": "Person", name: t.authorName },
    reviewBody: stripAccent(t.body),
  };
  if (t.rating != null) {
    node.reviewRating = {
      "@type": "Rating",
      ratingValue: t.rating,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return node;
}

function aggregateRatingNode(testimonials: Testimonial[]) {
  const rated = testimonials.filter((t) => t.rating != null);
  if (!rated.length) return null;
  const sum = rated.reduce((acc, t) => acc + (t.rating ?? 0), 0);
  const avg = sum / rated.length;
  return {
    "@type": "AggregateRating",
    ratingValue: Number(avg.toFixed(1)),
    bestRating: 5,
    worstRating: 1,
    ratingCount: rated.length,
    reviewCount: testimonials.length,
  };
}

function portableTextToPlain(blocks: unknown[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      const b = block as { _type?: string; children?: { text?: string }[] };
      if (b._type !== "block" || !b.children) return "";
      return b.children.map((c) => c.text ?? "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}
