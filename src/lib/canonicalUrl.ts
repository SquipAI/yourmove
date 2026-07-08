// The site builds with `build.format: "file"`, so at build time `Astro.url`
// carries the output filename (`/index.html`, `/privacy.html`). Strip it so
// canonical, og:url, hreflang alternates and JSON-LD @id all resolve to the
// same clean route URL (`trailingSlash: "never"`).
export function canonicalUrl(url: URL): string {
  return url.href.replace(/index\.html$/, "").replace(/\.html$/, "");
}
