import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { parseAccent } from "@lib/parseAccent";

// Read from source at build time (this endpoint is prerendered, cwd = project
// root). import.meta.url-relative reads break once the module is bundled into dist/.
const fontDir = join(process.cwd(), "src/assets/fonts");
const readFont = (file: string) => readFileSync(join(fontDir, file));

const FRAUNCES = readFont("Fraunces72pt-Regular.otf");
const FRAUNCES_ITALIC = readFont("Fraunces72pt-Italic.otf");
const DM_MONO = readFont("DMMono-Light.ttf");

const BRAND = "#DE3C37";
const INK = "#1A1A1A";
const TAGLINE = "#6B5F52";

// Brand-coloured heart, inlined as a data-URI so satori renders it as an <img>
// (satori does not draw emoji on its own).
const HEART =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${BRAND}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  );

type Style = Record<string, unknown>;
type Node = { type: string; props: Record<string, unknown> };

function el(type: string, style: Style, children?: unknown): Node {
  return { type, props: children === undefined ? { style } : { style, children } };
}

function titleWords(title: string): Node[] {
  const words: Node[] = [];
  for (const part of parseAccent(title)) {
    const style: Style = { marginRight: "0.24em" };
    if (part.accent) {
      style.fontStyle = "italic";
      style.color = BRAND;
    }
    for (const token of part.text.split(/\s+/).filter(Boolean)) {
      words.push(el("div", style, token));
    }
  }
  return words;
}

function card(title: string): Node {
  const topRow = el(
    "div",
    {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    [
      el("div", { fontSize: 32, color: "#000" }, "yourmove.ai"),
      el(
        "div",
        { display: "flex", alignItems: "center", fontSize: 26, color: TAGLINE },
        [
          el("div", {}, "maximizing P("),
          { type: "img", props: { src: HEART, width: 24, height: 24 } },
          el("div", {}, ")"),
        ],
      ),
    ],
  );

  const eyebrow = el(
    "div",
    {
      display: "flex",
      alignSelf: "flex-start",
      backgroundColor: INK,
      color: "#FFFFFF",
      fontSize: 16,
      letterSpacing: "0.18em",
      padding: "9px 17px",
      borderRadius: 999,
      marginBottom: 28,
    },
    "AI FOR DATING APPS",
  );

  const titleBlock = el(
    "div",
    {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "baseline",
      fontFamily: "Fraunces",
      fontSize: 80,
      lineHeight: 1.1,
      letterSpacing: "-0.015em",
      color: INK,
      maxWidth: 1010,
    },
    titleWords(title),
  );

  const main = el(
    "div",
    { display: "flex", flexDirection: "column", alignItems: "flex-start" },
    [eyebrow, titleBlock],
  );

  return el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "62px 66px",
      backgroundColor: "#FBF6EF",
      backgroundImage:
        "radial-gradient(circle at 88% 12%, #FCE9C3 0%, #FCE9C300 42%), radial-gradient(circle at 12% 112%, #F8DDD7 0%, #F8DDD700 46%)",
      fontFamily: "DM Mono",
    },
    [topRow, main],
  );
}

export async function renderOgPng(title: string): Promise<Buffer> {
  const svg = await satori(card(title) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Fraunces", data: FRAUNCES, weight: 400, style: "normal" },
      { name: "Fraunces", data: FRAUNCES_ITALIC, weight: 400, style: "italic" },
      { name: "DM Mono", data: DM_MONO, weight: 300, style: "normal" },
    ],
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
