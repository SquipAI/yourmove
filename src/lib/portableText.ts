// Shared types and helpers for rendering Sanity portable-text inline content.
// Used by PortableText.astro (full block renderer) and FaqSection.astro
// (paragraphs-only renderer for FAQ answers).

import { resolveNavHref } from "@lib/navHref";
import type { TargetType } from "@lib/linkTypes";
import { DEFAULT_LOCALE } from "@i18n/config";
import type { Locale } from "@i18n/config";

export type InternalLink = {
  _type: TargetType;
  _id: string;
  slug: string | null;
} | null;

export type SiteLink = {
  url: string;
  openInNewTab?: boolean;
  kind?: string;
} | null;

export type PTLink = {
  _key: string;
  _type: "link";
  href?: string;
  internalLink?: InternalLink;
  siteLink?: SiteLink;
};

export type PTSpan = {
  _key: string;
  _type: "span";
  text: string;
  marks: string[];
};

export type TextBlock = {
  _key: string;
  _type: "block";
  style: "normal" | "h2" | "h3" | "h4" | "h5" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: PTSpan[];
  markDefs: PTLink[];
};

export function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function resolveHref(
  link: PTLink,
  lang: Locale = DEFAULT_LOCALE,
): { href: string; newTab: boolean } {
  if (link.siteLink?.url) {
    return {
      href: link.siteLink.url,
      newTab: !!link.siteLink.openInNewTab,
    };
  }
  const ref = link.internalLink;
  if (ref) {
    const href = resolveNavHref(ref._type, ref.slug, null, lang);
    if (href) return { href, newTab: false };
  }
  return { href: link.href ?? "#", newTab: !!link.href };
}

export function inlineHTML(
  children: PTSpan[],
  markDefs: PTLink[],
  lang: Locale = DEFAULT_LOCALE,
): string {
  return children
    .map((span) => {
      let html = escape(span.text);

      for (const mark of span.marks) {
        const link = markDefs.find((m) => m._key === mark);
        if (link) {
          const { href, newTab } = resolveHref(link, lang);
          const extras = newTab
            ? ' target="_blank" rel="noopener noreferrer"'
            : "";
          html = `<a href="${escape(href)}"${extras}>${html}</a>`;
        } else if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "underline") html = `<u>${html}</u>`;
        else if (mark === "strike-through") html = `<s>${html}</s>`;
      }

      return html;
    })
    .join("");
}
