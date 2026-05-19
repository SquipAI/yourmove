import type { Locale } from "@i18n/config";
import type { Post } from "./types";

const SITE = "https://yourmove.ai";
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

const ORG = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "YourMove AI",
  url: SITE,
  logo: `${SITE}/web-app-manifest-512x512.png`,
};

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

export function articleSchema(
  post: Post,
  url: string,
  lang: Locale,
  breadcrumbs: BreadcrumbItem[],
) {
  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    url,
    inLanguage: lang,
    datePublished: post.createdAt,
    dateModified: post._updatedAt,
    author: AUTHOR,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    mainEntityOfPage: url,
    ...(post.metaDescription ? { description: post.metaDescription } : {}),
    ...(post.summary ? { abstract: post.summary } : {}),
    ...(post.mainImage?.url ? { image: post.mainImage.url } : {}),
    ...(post.tags?.length
      ? { keywords: post.tags.map((t) => t.title).join(", ") }
      : {}),
  };

  const graph: unknown[] = [
    ORG,
    WEBSITE,
    article,
    buildBreadcrumb(breadcrumbs, `${url}#breadcrumb`),
  ];

  if (post.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: post.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: portableTextToPlain(item.answer),
        },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
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
