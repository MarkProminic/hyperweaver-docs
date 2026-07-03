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
- **Everything volatile is fetched live in the browser** (`head_custom.html`):
  version + releases + changelog from each component's GitHub, and each component's
  OpenAPI spec loaded by its Swagger UI shell from that component's published
  release asset. No spec/changelog is ever baked in, so nothing goes stale and the
  docs build has **zero backend source coupling**.

## Local build

```bash
bundle install
npm run generate-docs        # emits the Swagger UI shells
JEKYLL_ENV=production bundle exec jekyll build
# output in _site/ ; served in-app under /docs (baseurl)
```

## Structure

- `docs/` — the documentation pages (server + `zoneweaver-agent/` section)
- `_config.yml` — Jekyll + Just the Docs config (`baseurl: /docs`)
- `head_custom.html` — the runtime GitHub fetch loaders (version/releases/changelog)
- `scripts/generate-docs.js` — emits the Swagger UI shells (backend-agnostic)
- root community files (`SUPPORT.md`, `CODE_OF_CONDUCT.md`, …) — `{% include %}`-d
  into their `docs/*.md` wrapper pages
