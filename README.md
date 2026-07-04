# Hyperweaver Docs

The unified documentation site for the **Hyperweaver platform** — covering the
Hyperweaver Server, the Zoneweaver Agent, and (later) the Hyperweaver Agent.

Built with Jekyll + [Just the Docs](https://just-the-docs.com/). This repo is the
**single source of truth** for platform documentation; it publishes a versioned
artifact (`hyperweaver-docs-{version}.tar.gz`) that the Hyperweaver UI build folds
into `dist/docs`, so every backend that embeds the UI serves `/docs` automatically —
no per-backend docs pipeline.

## Design

- **Prose is static** (guides, configuration references, API overviews) — rendered
  by Jekyll at build.
- **Version + releases are fetched live in the browser** (`head_custom.html`) from
  each component's GitHub; the **changelogs** are pulled at build by
  `scripts/generate-docs.js`. Nothing goes stale and the docs build has **zero
  backend source coupling**.
- **The API reference is not embedded here.** It's served live by each backend at
  **`/api-docs`** (dark-themed Swagger UI); a Hyperweaver Server additionally relays
  a selected agent's spec at **`/agent/api-docs`**. The app's sidebar links to both.

## Local build

```bash
bundle install
npm run generate-docs        # fetches the component changelogs
JEKYLL_ENV=production bundle exec jekyll build
# output in _site/ ; served in-app under /docs (baseurl)
```

## Structure

- `docs/` — the documentation pages (server + `zoneweaver-agent/` section)
- `_config.yml` — Jekyll + Just the Docs config (`baseurl: /docs`)
- `head_custom.html` — the runtime GitHub fetch loaders (version/releases)
- `scripts/generate-docs.js` — fetches the component changelogs at build
- root community files (`SUPPORT.md`, `CODE_OF_CONDUCT.md`, …) — `{% include %}`-d
  into their `docs/*.md` wrapper pages
