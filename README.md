# YourMove AI

Astro 7 (static, Cloudflare) + Sanity (document-level i18n: EN/ES/DE) + Tailwind 4.
The repo holds both the public site (`src/`) and the Sanity Studio (`studio/`,
`sanity.config.ts`).

## Requirements

- Node **24** (see `.node-version` — use `fnm`/`nvm` to match)
- **pnpm** (not npm). The version is pinned in `package.json` → `packageManager`.

> **First-time / after cloning:** run `corepack enable` once, then `pnpm install`.
> Don't run `npm install` — this repo uses a pnpm lockfile and npm will fight it.

## Commands

Run from the project root:

| Command             | Action                                            |
| :------------------ | :------------------------------------------------ |
| `pnpm install`      | Install dependencies                              |
| `pnpm dev`          | Start the site dev server (`localhost:4321`)      |
| `pnpm build`        | Build the static site to `./dist/`                |
| `pnpm preview`      | Preview the production build locally              |
| `pnpm astro check`  | Type-check the project                            |
| `pnpm sanity dev`   | Run the Sanity Studio locally                     |
| `pnpm sanity deploy`| Deploy the hosted Studio                          |

## Structure

```text
src/          # Astro site — pages, components, lib/queries (Sanity data layer)
studio/       # Sanity Studio — schemas, structure, actions, plugins
public/       # static assets
```

The build fetches published content from Sanity at build time; the site deploys as
static assets to Cloudflare.
