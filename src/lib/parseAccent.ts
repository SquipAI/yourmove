// Split a string on `*…*` accent markers.
// "Every AI tool, in *one place.*" → [
//   { text: "Every AI tool, in ", accent: false },
//   { text: "one place.",          accent: true  },
// ]
// Unbalanced trailing `*` is left as plain text.
export type AccentPart = { text: string; accent: boolean };

export function parseAccent(input: string | null | undefined): AccentPart[] {
  if (!input) return [];
  const parts: AccentPart[] = [];
  const re = /\*([^*]+)\*/g;
  let lastIndex = 0;
  for (const match of input.matchAll(re)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push({ text: input.slice(lastIndex, start), accent: false });
    }
    parts.push({ text: match[1], accent: true });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < input.length) {
    parts.push({ text: input.slice(lastIndex), accent: false });
  }
  return parts;
}
