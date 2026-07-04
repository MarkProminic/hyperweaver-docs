---
title: Capability Model
layout: default
nav_order: 6
parent: Zoneweaver Agent
permalink: /zoneweaver-agent/capability-model/
---

# Capability Model & Status Surface Mapping

{: .no_toc }

> **Agent API v1 — SHIPPED (2026-07-04, roadmap item 1).** This doc began as the item-2
> mapping of the agent's status/capability surface and the C7 token vocabulary; the gaps it
> recorded are now closed. `features` is **dynamic + complete** (21 tokens, config-aware), the
> **`machines` noun is canonical** with `/zones/*` kept as this Node agent's alias (O1), a
> **direct-mode role model** (`admin`/`operator`/`viewer`) is enforced, and the OpenAPI is
> published as the versioned **Agent API v1** contract.
>
> **Governing docs:** `hyperweaver-architecture.md` (§3.1, §4, §6, §7) and
> `hyperweaver-item2-contract.md` (§2, §3 C7). This doc never overrides them. Code references
> point into the `zoneweaver-agent` repo.

## Table of contents

{: .no_toc .text-delta }

1. TOC
   {:toc}

---

## 1. TL;DR

The Agent API contract (architecture **D1**) advertises capabilities via the public
`GET /api/status` — a slim identity + capability payload both host-agents emit
(zoneweaver-agent Node/Bhyve today; hyperweaver-agent Go/VirtualBox implements the same v1).

- **Mode discovery:** `role: 'agent'` (vs the Server's `role: 'server'`) — the single field
  the SPA probes to pick Direct vs Aggregated (`hyperweaver-item2-contract.md` §2).
- **Capability tokens:** `hypervisors[]`, `console[]`, `features[]`, `auth[]` — presence-based,
  kebab-case. The UI renders conditionally; **render-all only when a whole token set is absent**
  (see §5.1 for the exact gating semantics — this is easy to misread).
- **Two divergences** between the live payload and C7's original _proposed_ shape (§4):
  the live shape won per D1.

---

## 2. What `/api/status` exposes (the C7 source of truth)

Served at **both** `/status` and `/api/status` (unauthenticated) — `routes/index.js`.
`/api/status` is the unconditional mode-discovery probe URL for the SPA.

Emitting code: `controllers/StatusController.js` (`getStatus`); feature tokens built by
`buildFeatures()` from `PLATFORM_FEATURES` + `CONFIG_GATED_FEATURES` (same file).

```jsonc
{
  "role": "agent", // 'agent' | 'server' — DIRECT vs AGGREGATED discovery
  "agent": "zoneweaver-agent", // implementation id (vs 'hyperweaver-agent' Go)
  "hypervisors": ["bhyve"], // capability: hypervisor family/families
  "platform": "omnios", // os.platform() 'sunos' → 'omnios', else raw
  "arch": "x86_64", // normalized: x64→x86_64, arm64→aarch64
  "version": "0.3.5", // package.json app version
  "hostname": "host1.example.com",
  "auth": ["apikey"], // capability: accepted login mechanisms
  "bootstrapAvailable": true, // true until first API key exists (first-boot UX)
  "console": ["vnc"], // capability: graphical VM console protocols
  "features": [
    // capability tokens — dynamic (platform ∧ config)
    "zfs",
    "vnics",
    "boot-environments",
    "packages",
    "repositories",
    "swap",
    "time-sync",
    "syslog",
    "system-users",
    "processes",
    "zlogin",
    "ssh",
    "host-terminal",
    "tasks",
    "provisioning",
    // config-gated (present only when the block is enabled):
    "fault-management",
    "devices",
    "log-streaming",
    "file-browser",
    "artifacts",
    "templates",
  ],
  "uptime": 12345, // process uptime, seconds
}
```

**Identity vs capability split.** `role`/`agent`/`platform`/`arch`/`version`/`hostname`/
`uptime`/`bootstrapAvailable` are _identity_. `hypervisors`/`console`/`auth`/`features` are the
_capability tokens_ C7 governs. This is explicitly **not** `/stats` — no interface/IP/CPU dumps.

---

## 3. The C7 vocabulary (AGENT-owned, AGREED)

### 3.1 `role` — mode discovery (shared enum)

`'agent'` on this agent — **hardcoded**; this Node agent has **no server mode** (there is no
config that flips it — `server` is Hyperweaver Server / the future Go dual-mode agent,
architecture O4). Drives Direct vs Aggregated in the tree. A bare agent advertises no
aggregation ⇒ UI renders no root, one host, no Add-Host (architecture R4/D11).

### 3.2 `hypervisors: string[]` — Zone↔Machine labelling

Values: `bhyve` (this agent) | `virtualbox` (hyperweaver-agent Go). **Plural array** — the live
shape; C7's proposed singular `hypervisor` was superseded (§4). **Always array-of-one today** —
one agent = one hypervisor family (R4/D11), no intra-agent mixing; mixing occurs only across
agents in the aggregated tree.

Drives the capability-driven noun (O1) — label rule = union over the visible scope:

- contains only `bhyve` → **"Zones"**
- contains only `virtualbox` → **"Machines"**
- mixed chrome (Aggregated across both) → **"Machines"**

**Routes (O1, shipped):** `machines` is the **canonical** noun — every machine-scoped route is
registered at `/machines/*` AND kept at its legacy `/zones/*` alias on this Node agent
(`routes/index.js` `withMachinesAlias`; the VNC WebSocket upgrade accepts both). The published
Agent API v1 spec documents only the canonical `/machines/*` form. The UI **label** flips on
this token; both nouns work on the wire against this agent.

### 3.3 `console: string[]` — graphical VM console protocols

Values today: `vnc`. Later: `rdp` (architecture O2 — VNC-first, RDP a deliberately-later second
capability). Scope = the noVNC-over-WS viewer only (architecture §7). Serial/shell terminals are
**not** here — they are `features` tokens (§3.4), a different transport class.

### 3.4 `features: string[]` — everything else the UI conditionally renders

Presence = supported. Kebab-case. Split by whether the token is OmniOS/bhyve-specific (absent on
the VirtualBox agent) or common to any host-agent — so the UI author knows which panels
legitimately vanish on a mixed cluster:

| Token               | Panel / surface it gates                                              | Agent endpoint(s)                                              | OmniOS-specific?     |
| ------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------- |
| `zfs`               | ZFS pools + datasets                                                  | `/storage/pools`, `/storage/datasets`, `/monitoring/storage/*` | **yes**              |
| `vnics`             | VNIC/dladm networking (vnics, vlans, bridges, aggregates, etherstubs) | `/network/*`                                                   | **yes**              |
| `fault-management`  | illumos FMA faults                                                    | `/system/fault-management/*`                                   | **yes**              |
| `boot-environments` | beadm boot environments                                               | `/system/boot-environments`                                    | **yes**              |
| `packages`          | IPS package management                                                | `/system/packages/*`                                           | **yes**              |
| `repositories`      | IPS publishers                                                        | `/system/repositories`                                         | **yes**              |
| `swap`              | swap areas                                                            | `/system/swap/*`                                               | **yes**              |
| `time-sync`         | NTP/time-sync + timezone                                              | `/system/time-sync/*`, `/system/timezone`                      | **yes**              |
| `syslog`            | syslog config                                                         | `/system/syslog/*`                                             | **yes**              |
| `system-users`      | RBAC users/groups/roles                                               | `/system/users`, `/system/roles`, `/system/rbac/*`             | **yes**              |
| `processes`         | illumos ptools process manager                                        | `/system/processes/*`                                          | **yes**              |
| `zlogin`            | zone serial console (WS)                                              | `/machines/:m/zlogin/*`                                        | **yes**              |
| `provisioning`      | provisioning pipeline/profiles/recipes                                | `/provisioning/*`, `/machines/:m/provision`                    | **yes** (bhyve path) |
| `devices`           | PCI device inventory + PPT passthrough                                | `/host/devices/*`, `/host/ppt-status`                          | **yes**              |
| `ssh`               | in-guest SSH shell (WS)                                               | `/machines/:m/ssh/*`                                           | common*              |
| `host-terminal`     | host PTY shell (Host Shell)                                           | `/terminal/*` + `/term/:id` WS                                 | common               |
| `tasks`             | task queue panel                                                      | `/tasks/*`                                                     | common               |
| `log-streaming`     | live log tail (WS)                                                    | `/system/logs/:l/stream/*`                                     | common               |
| `file-browser`      | filesystem browser                                                    | `/filesystem/*`                                                | common               |
| `artifacts`         | ISO/image artifact storage                                            | `/artifacts/*`                                                 | common               |
| `templates`         | BoxVault template registry                                            | `/templates/*`                                                 | common               |

\* `ssh` is transport-common but depends on in-guest reachability (guest-agent IP) — see the
console-access roadmap item. `host-terminal` spawns `bash` on OmniOS / `powershell.exe` on
Windows — present on both agents.

**All 21 tokens are now emitted** (Agent API v1): 15 platform tokens unconditionally
(`PLATFORM_FEATURES`) and 6 config-gated tokens when their config block is enabled
(`CONFIG_GATED_FEATURES`): `fault-management`↔`fault_management.enabled`,
`devices`↔`host_monitoring.enabled`, `log-streaming`↔`system_logs.enabled`,
`file-browser`↔`file_browser.enabled`, `artifacts`↔`artifact_storage.enabled`,
`templates`↔`template_sources.enabled`.

### 3.5 `auth: string[]` — accepted login mechanisms

Value today: `apikey`. Not `local`. `apikey` is the concrete form of architecture §6's _local
tier_ (the agent's bootstrap-first-key model). `oidc` is added when the agent becomes an OIDC
client (federation roadmap item). **Distinct from SERVER's C1 `auth_provider`** — C1 is the
logged-in _user's_ identity source in Aggregated mode (`local|ldap|oidc-<name>`); this `auth[]`
is what login the _agent itself_ accepts. UI must not conflate the two.

**Cross-repo namespace (C7/C1, RATIFIED):** the Server's `/api/status` emits
`auth: ['local','ldap','oidc']`; this agent emits `auth: ['apikey']`. Same field, identical
_shape_ (`string[]`), divergent _values_ by role — exactly the D1 capability model. ONE shared
token namespace `{apikey, local, ldap, oidc}`, each token = a distinct login affordance; **the
UI branches on the token (which login form), not on role.** `apikey` ≠ `local` (bearer-key paste
vs account form) — they are not aliased.

`bootstrapAvailable` rides alongside `auth` (identity, not capability): drives first-boot key
setup UX; mirrors the exact availability check `bootstrapFirstApiKey` enforces.

---

## 4. Divergences from C7's original _proposal_ — reconciled (historical)

| C7 proposed                     | Live code                        | Resolution                                                                           |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `hypervisor` (singular)         | `hypervisors: string[]`          | **Adopted plural array.** D1: the live spec is the reference.                        |
| `auth` = `local\|oidc`          | `auth: ['apikey']`               | **Vocabulary = `apikey` \| `oidc`.** `apikey` = the local tier's concrete mechanism. |
| `features[]` = partial list     | now the full 21-token set (§3.4) | Extended + made dynamic in Agent API v1.                                             |
| (C7 silent on `role`/`console`) | both emitted                     | Documented here; `console` matches architecture §7 (vnc[+rdp]).                      |

No contradiction with architecture §3.1's OmniOS-only panel examples (ZFS pools, VNICs, fault
mgmt) — all three are live tokens.

---

## 5. Shipped mechanisms (roadmap item 1, 2026-07-04)

### 5.1 Dynamic `features` emission + the gating semantics

`features` is no longer a static array. `buildFeatures()` advertises a token iff _(the platform
supports the surface)_ AND _(its config kill-switch, when one exists, is enabled)_ — so e.g.
`fault_management.enabled: false` now correctly **removes** `fault-management` from the payload
(previously the token stayed advertised while the endpoints returned 503 — the verified misfire
this replaced).

**Gating semantics (unchanged, do not misread the fallback).** The UI's `hasFeature(token)`
renders-all ONLY when `features` is _absent / not an array_; with a present array it returns
`features.includes(token)` — non-listed tokens are treated as unsupported and **hidden**.
Consequences now that all 21 tokens are emitted:

- The UI may gate **every** §3.4 surface on its token — the "render UNGATED until item-1 emits"
  interim rule from item 2 is retired.
- A token disappearing because an operator disabled its config block is the system working as
  designed: the panel hides instead of rendering a dead surface.
- New tokens append safely: an older UI simply doesn't gate on names it doesn't know.

### 5.2 Direct-mode role model (`admin` / `operator` / `viewer`)

The flat super-admin API key is replaced by a three-tier role per key:

- **Storage:** `entities.role` (`models/EntityModel.js`; idempotent migration in
  `config/DatabaseMigrations.js`). Existing keys default to **`admin`** — the behavior they were
  created under; nothing breaks on upgrade.
- **Enforcement:** central method+path policy in `middleware/VerifyApiKey.js` (`requiredRole`),
  checked on every authenticated request:
  - `/api-keys/info` (self-identification) — any valid key.
  - `/api-keys/*` and `/settings/*` — **admin, all methods** (key management is admin metadata;
    `GET /settings` can expose registry credentials).
  - `/ws-ticket` and `/filesystem/*` — **operator** (tickets are unbound and open console
    WebSockets; filesystem reads return host file contents).
  - other `GET`/`HEAD` — **viewer**.
  - other mutations — **operator**; **admin** on `/server`, `/system/host`, `/system/users`,
    `/system/groups`, `/system/roles`, `/database`.
- **Key management:** `POST /api-keys/generate` accepts `role` (default `admin`); bootstrap key
  is always `admin`; list/info expose `role`; delete/revoke refuse to remove the **last active
  admin key** (409 — lockout guard).
- Insufficient role → **403** `{ msg: "Insufficient role: …" }`.

This is the authorization axis the console-access roadmap item builds on (who opens which
console); OIDC users/groups arrive with federation.

### 5.3 WebSocket auth is ticket-based, unbound

Every WS upgrade (VNC, zlogin, SSH, host-terminal, log-stream, task-stream) requires `?ticket=`
minted at `GET /ws-ticket` (60s TTL, reusable, **unbound** — any valid ticket authorizes any
upgrade; verified in `lib/WebSocketHandler.js`). Capability tokens gate _whether the panel
renders_; the ticket gates _the upgrade_; **minting now requires the `operator` role** (§5.2).
Per-console authorization (which console, which machine) remains future work for the
console-access item.

### 5.4 Console tokens

All four console/terminal classes are now tokenized: VNC via `console: ['vnc']`; `zlogin`,
`ssh`, `host-terminal` via `features` (§3.4). Graphical protocols live in `console[]`;
shells/serials in `features[]` — matching architecture §7 (console = the noVNC viewer). The
remaining two WS classes (`log-stream`, `task-stream`) are data streams gated by
`log-streaming`/`tasks`.

### 5.5 Published Agent API v1 spec

- **Identity:** `info.title: "Agent API"`, `info.version: "1.0.0"` — the **contract** version
  (frozen; deliberately not release-stamped). The implementing app version lives in
  `info.x-app-version` (release-please-stamped; `scripts/sync-versions.js` targets only that
  key).
- **Canonical noun:** the generated spec's `/zones/*` path keys are rewritten to `/machines/*`
  at build time (`config/swagger.js`) — the contract documents one noun; the `/zones/*` alias is
  a Node-agent implementation detail.
- **Delivery:** served live at `/api-docs/swagger.json` (+ Swagger UI at `/api-docs`);
  `npm run generate-openapi` writes `openapi.json`, published as a GitHub Release asset that
  this docs site renders. The Go hyperweaver-agent and the UI's generated types consume this
  artifact (D1: one spec, two implementations).
- **Caveat — lifted, not audited:** v1 was _lifted_ from the existing controller JSDoc per D1.
  Per-endpoint accuracy (documented params/bodies vs handler behavior) has not been
  independently audited; treat discrepancies as spec bugs and fix the JSDoc.

---

## 6. Machines surface — shape the UI tree consumes

Canonical paths shown; each also answers at `/zones/*` on this agent (§3.2).

- `GET /machines` (`controllers/ZoneManagement/ZoneQueryController.js`) → `{ zones: Zone[],
total }`. Filters: `?status=`, `?tag=`, `?orphaned=`.
- `GET /machines/:name` → `{ zone_info, configuration, active_vnc_session, pending_tasks,
system_status }`. Reconciles DB status against live `zoneadm` on read.
- **Machine status enum** (`models/ZoneModel.js`):
  `configured | incomplete | installed | ready | running | shutting_down | down`
  → the tree's **status dots**: `running`→green, `shutting_down`→amber,
  `ready/installed/configured`→grey, `down/incomplete`→red, `is_orphaned:true`→hollow/warning.
- Tree/label fields: `name`, `zone_id`, `host`, `status`, `brand` (bhyve/kvm/lx/illumos),
  `vnc_port`, `is_orphaned`, `vm_type` (template|development|production|firewall|other),
  `tags[]`, `notes`.
- **Single-host:** every machine carries `host` but a bare agent manages one host (R4/D11); the
  Aggregated tree groups by host at the Server layer, not here.

---

## 7. Monitoring surface — capability rollups behind the `features` tokens

`controllers/HostMonitoringController/index.js` fans out to:

- **network** — interfaces, usage, ipaddresses, routes (gate on `vnics`)
- **storage** — zfs pools, datasets, disks, disk-io, pool-io, arc (gate on `zfs`)
- **system metrics** — cpu, memory, load
- **summary / host info** — `/monitoring/host`, `/monitoring/summary`

All under `/monitoring/*`. Gate the storage/network monitoring panels on the same `zfs`/`vnics`
tokens as their management counterparts. `host_monitoring.enabled` also gates the `devices`
token (device inventory comes from the monitoring collector).

---

## 8. Cross-references

- Architecture §3.1 (UI capability-driven rendering), §4 (Agent API contract / capabilities),
  §6 (tiered auth), §7 (console = VNC-over-WS), O1 (machines noun), D1 (one spec, two agents).
- Contract §2 (settled tree design), §3 C7 (this vocabulary), C1 (SERVER `auth_provider` — do
  not conflate with §3.5), C6 (aggregate-root rename — SERVER-owned, N/A to a bare agent: no
  root).
