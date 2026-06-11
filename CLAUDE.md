# YourMove AI — site

Astro 6 (static, Cloudflare) + Sanity (document-level i18n: EN/ES/DE) + Tailwind 4.

## Styles

- **No duplicated chunks.** A repeated *class combo* (3+ places) → `@utility` in global.css (`card`, `btn-*`, `accent`, `nav-item`). A repeated *markup block* (2+ places) → extract a component. Never copy-paste long class strings between files.
- **Tokens first.** New colors, type sizes, spacings, tracking go into `@theme` in `src/styles/global.css` — never raw hex/rem values in markup. Derived shades use `oklch(from var(--color-…))`.
- **No `<style>` blocks** in `.astro` files — Tailwind classes only.
- **Spacing comes from the parent**: `gap-*` / `space-y-*` on the container, not `mt-*` on children. `mt-auto` and optical offsets (e.g. `mt-2` aligning text to an avatar) are fine.
- **Pixel arbitrary values are allowed** (`w-[44px]`) — do not rewrite them to scale equivalents.
- Conditional classes via `class:list`; the `class` prop is destructured as `class: cls`.

## Code conventions

- Dumb components: data fetching only in pages/layouts; components receive props.
- `lang: Locale` is a **required** prop everywhere — no `DEFAULT_LOCALE` fallbacks in components (silent EN on ES/DE pages).
- Missing required data → throw early in frontmatter (`if (!x) throw new Error(...)`), never `!` assertions.
- Page composition lives in the route file (`src/pages/[...lang]/…`); no intermediate template layers. Tool page hero/sections switch on `tool.kind` in `[slug].astro`.
- Kind-specific tool sections are prefixed: `PhotoExamplesSection`, `ReviewComparisonsSection`, `ReviewReportPreview`.
- GROQ: shared projections live in `src/lib/queries/projections.ts` only when used by ≥2 query files; single-use shapes stay inline.

## Sanity Studio

- Validation params are `(r)` / `(ctx)`; shared helpers in `studio/schemas/shared.ts`: `hideUnlessKind`, `docKind`, `docLang`, `exactLength`, `requiredImage`, `pageTitleField`, `pageDescriptionField`, `translatedField`, `hiddenOnNonEn`.
- Never rename data-bearing **field** names (orphans content); group names and titles are safe.
- Feature icons: `FEATURE_ICON_NAMES` in `src/lib/icons.ts` — single source for the Studio dropdown and `Icon.astro` (compile-time checked).

## Checks

- `npx astro check` at checkpoints (not after every edit); `npm run build` before considering work done.
