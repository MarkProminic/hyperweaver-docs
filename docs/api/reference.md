---
title: API Reference
layout: default
nav_order: 2
parent: API Reference
permalink: /api/reference/
---

# Interactive API Reference

The interactive API reference is served **live by the running backend** at
[`/api-docs`](/api-docs) — a dark-themed Swagger UI with full request/response
schemas and "Try it out", always matching the deployed version.

- **Hyperweaver Server** — [`/api-docs`](/api-docs) documents the Server's own API.
- **A specific agent** — open **API Reference → Agent API** in the app sidebar (or
  [`/agent/api-docs`](/agent/api-docs)). It resolves to the host you've selected in the
  navbar, and the Server relays that agent's live spec.
- **Standalone agent (Direct mode)** — [`/api-docs`](/api-docs) is that agent's own API.

## Download the spec

- **[Hyperweaver Server OpenAPI](https://github.com/Makr91/hyperweaver-server/releases/latest/download/openapi.json)** — raw OpenAPI 3.0 specification
- **[Zoneweaver Agent OpenAPI](https://github.com/Makr91/zoneweaver-agent/releases/latest/download/openapi.json)** — raw OpenAPI 3.0 specification

---

_The interactive reference lets you explore every endpoint, view schemas, and test calls
from your browser. It's served live by the backend, so it never goes stale._
