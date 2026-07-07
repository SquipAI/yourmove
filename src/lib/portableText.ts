// Shared types and helpers for rendering Sanity portable-text inline content.
// Used by PortableText.astro (full block renderer) and FaqSection.astro
// (paragraphs-only renderer for FAQ answers).

import { resolveNavHref, isExternalHref, type TargetType } from "@lib/links";
import { parseAccent } from "@lib/parseAccent";
import { DEFAULT_LOCALE } from "@i18n/config";
import type { Locale } from "@i18n/config";

export type InternalLink = {
  _type: TargetType;
  _id: string;
  slug: string | null;
} | null;

export type SiteLink = {
  url: string;
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
  marks?: string[];
};

export type TextBlock = {
  _key: string;
  _type: "block";
  style: "normal" | "h2" | "h3" | "h4" | "h5" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: PTSpan[];
  markDefs?: PTLink[];
};

export function escape(text: unknown): string {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// External links (http/https) open in a new tab; internal paths and
// mailto/tel stay in the same tab. No editor toggle — pattern-driven.
export function resolveHref(
  link: PTLink,
  lang: Locale = DEFAULT_LOCALE,
): { href: string; newTab: boolean } {
  if (link.siteLink?.url) {
    return { href: link.siteLink.url, newTab: isExternalHref(link.siteLink.url) };
  }
  const ref = link.internalLink;
  if (ref) {
    const href = resolveNavHref(ref._type, ref.slug, null, lang);
    if (href) return { href, newTab: false };
  }
  const href = link.href ?? "#";
  return { href, newTab: isExternalHref(href) };
}

export type AnswerChunk =
  | { kind: "block"; block: TextBlock }
  | { kind: "list"; listItem: "bullet" | "number"; items: TextBlock[] };

// Group a flat FAQ-answer block array into paragraphs and runs of list items,
// so a renderer can wrap consecutive bullets/numbers in a single <ul>/<ol>.
// FAQ answers use inlineRichTextField (no images/embeds), so only `block`s and
// list runs are produced — no other block types to account for.
export function groupAnswerBlocks(
  blocks: TextBlock[] | null | undefined,
): AnswerChunk[] {
  const chunks: AnswerChunk[] = [];
  for (const b of blocks ?? []) {
    if (b?._type !== "block") continue;
    if (b.listItem) {
      const last = chunks.at(-1);
      if (last?.kind === "list" && last.listItem === b.listItem) {
        last.items.push(b);
      } else {
        chunks.push({ kind: "list", listItem: b.listItem, items: [b] });
      }
    } else {
      chunks.push({ kind: "block", block: b });
    }
  }
  return chunks;
}

// Table cells are plain strings; the only markup is the sitewide `*…*` accent
// convention (same parser as page titles) — rendered as a styled span the CSS
// controls, never a semantic <em>/<strong>. Escaped first, so cells can never
// inject HTML.
export function tableCellHTML(text: string | null | undefined): string {
  return parseAccent((text ?? "").trim())
    .map((part) => {
      const html = escape(part.text).replace(/\n/g, "<br>");
      return part.accent ? `<span class="accent">${html}</span>` : html;
    })
    .join("");
}

export function inlineHTML(
  children: PTSpan[] | null | undefined,
  markDefs: PTLink[] | null | undefined,
  lang: Locale = DEFAULT_LOCALE,
): string {
  return (children ?? [])
    .map((span) => {
      // Standalone \n span = hard break; leading/trailing \n elsewhere = strip.
      // Guard against malformed spans (missing or non-string text from bad
      // migration data) so a single corrupt block can't crash the build.
      const raw = typeof span.text === "string" ? span.text : "";
      let html = /^\n+$/.test(raw)
        ? "<br>"
        : escape(raw.replace(/^\n+|\n+$/g, "")).replace(/\n/g, "<br>");

      for (const mark of span.marks ?? []) {
        const link = (markDefs ?? []).find((m) => m._key === mark);
        if (link) {
          const { href, newTab } = resolveHref(link, lang);
          const extras = newTab
            ? ' target="_blank" rel="noopener noreferrer"'
            : "";
          html = `<a href="${escape(href)}"${extras} class="text-brand underline transition-colors">${html}</a>`;
        } else if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "underline") html = `<u>${html}</u>`;
        else if (mark === "strike-through") html = `<s>${html}</s>`;
      }

      return html;
    })
    .join("");
}
