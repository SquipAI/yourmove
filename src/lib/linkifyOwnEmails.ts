const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps `*@<domain>` occurrences in a mailto link. Off-domain emails stay
// as plain text. Result is meant to be rendered via `set:html`.
export function linkifyOwnEmails(text: string, domain: string): string {
  const re = new RegExp(`[\\w.+-]+@${escapeRegex(domain)}\\b`, "gi");
  return text.replace(
    re,
    (m) =>
      `<a href="mailto:${m}" class="text-brand underline transition-colors hover:text-brand-darker">${m}</a>`,
  );
}
