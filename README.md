# YourMove AI

Astro 7 (static, Cloudflare) + Sanity (document-level i18n: EN/ES/DE) + Tailwind 4.
The repo is **two independent packages**: the public site (root, `src/`) and the
Sanity Studio (`studio/`). Each has its own `package.json` + lockfile, so the site
build never installs the Studio's deps.

## Requirements

- Node **24** (see `.node-version` — use `fnm`/`nvm` to match)
- **pnpm** (not npm). The version is pinned in `package.json` → `packageManager`.

> **First-time / after cloning:** run `corepack enable` once, then `pnpm install`.
> Don't run `npm install` — this repo uses a pnpm lockfile and npm will fight it.

## Site (root)

| Command            | Action                                       |
| :----------------- | :------------------------------------------- |
| `pnpm install`     | Install site dependencies                    |
| `pnpm dev`         | Site dev server (`localhost:4321`)           |
| `pnpm build`       | Build the static site to `./dist/`           |
| `pnpm preview`     | Preview the production build locally         |
| `pnpm astro check` | Type-check the site                          |

## Studio (`studio/`)

Its own package — install and run it separately (`-C studio` runs pnpm in that dir):

| Command                      | Action                          |
| :--------------------------- | :------------------------------ |
| `pnpm -C studio install`     | Install Studio dependencies     |
| `pnpm -C studio dev`         | Run the Sanity Studio locally   |
| `pnpm -C studio run deploy`  | Deploy the hosted Studio        |

## Structure

```text
src/          # Astro site — pages, components, lib/queries (Sanity data layer)
studio/       # Sanity Studio package — schemas, structure, actions, plugins, config
public/       # static assets
```

The Studio imports a few shared modules from `src/` (locale config, link/icon
helpers) via path aliases; `sanity build` bundles them. The site build fetches
published content from Sanity at build time and deploys static assets to Cloudflare.
