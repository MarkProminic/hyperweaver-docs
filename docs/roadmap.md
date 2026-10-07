---
title: Roadmap
layout: default
nav_order: 8
description: 'Hyperweaver platform rules, decisions and roadmap'
permalink: /roadmap/
---

# Hyperweaver Platform — Rules, Decisions & Roadmap

> **This file REPLACES `hyperweaver-architecture.md` AND
> `hyperweaver-provisioning-design.md`** (both deleted) — every binding
> rule, decision, and contract from both docs lives here, reorganized to be
> readable and trackable. The provisioning contracts are Part 9. The AI sync
> file points here.
>
> **How this file works:** Part 1 is the working board — read it top to
> bottom, quickest-biggest-unlock first. Every task carries a checkbox;
> when the work ships, its box gets CHECKED. This tracks progress but is
> still NOT a journal — no narrative, no play-by-play; the sync file stays
> the only cross-AI channel and this file is not it. Parts 2–9 are the
> permanent reference: rules, requirements, decisions, system shape, and
> the provisioning contracts.

---

## Part 1 -- THE BOARD (work, in execution order)

### Wave 1 -- ICBINS mode ("I Can't Believe It's Not SHI") — the big rock (hyperweaver-ui)

The themed/opinionated UI mode recreating SHI's guided Domino-family flow
(same UI, opinionated defaults, zero required decisions) on top of the
modular knobs already built, plus the SHI branding/color-scheme mode to ease
old SHI users in.

- [ ] **Full read of the SHI sources** (every screen and flow) + the
  screenshots — the mandatory first step.

- [ ] **ICBINS mode GUI built** (hyperweaver-ui).

- [ ] **SHI branding/color-scheme mode built** (hyperweaver-ui).

- [ ] **hyperweaver-agent extras** — tiny share: expose/react to the few
  extras the mode needs. Config `ui.shi_mode` is already advertised as
  `shi_mode` on the public GET /api/status (pre-auth, so theming applies
  immediately).

- [ ] **Domino packages converted to the star-template shape** — seeds the
  mode with real content; the wave finishes here.

- [ ] **SHI-parity pieces that ride this wave** (agent wires already exist
  for most): Support page (open-log-folder + new-GitHub-issue buttons) ·
  How-it-works/About static pages · footer host-environment display
  (OS/arch/cores/RAM + VirtualBox/Git versions — Go `internal/prereqs` wire
  exists, UI display missing) · header "update now" (Go `internal/updater`
  exists — UI trigger/status) · vagrant-vs-VBox machine-count reconcile +
  refresh + "open VirtualBox" button · settings toggles (browser detection,
  default-NIC detection, file-sync defaults, keep-servers-running-on-exit)
  · assets/file-cache UX (Go `internal/assets` exists — pairs with the
  File Mgmt/Assets glue item below).

- **Mode-facing extras** land in the manifest's reserved
  `metadata.presentation` bucket — never schema revs.

- **Binding rulings that still govern this area:** TRUE Jinja2 on both
  agents — Go renders gonja v2, zoneweaver renders nunjucks; shared
  contract: undefined variables render EMPTY STRING, includes resolve inside
  the package's `templates/` dir only. Provisioning is zoneweaver's model —
  agents act on behalf of `Hosts.rb`, never execute it; packages keep
  `Hosts.rb`/`Vagrantfile` for standalone vagrant users. One system for ALL
  provisioners; none first-class. Role gating = boolean role-enable flags,
  not `run_tasks` (known package-side quirk: the playbook generator's
  `enabled_roles` still keys off run_tasks — theirs to fix).

- [ ] **File Management / Assets glue** — the storage exists (artifact
  storage, Installer Files page, working-copy installer hard-links);
  missing: the installer asks where the assets dir lives, provisioner files
  seed into it on install, Windows deep-nesting handled. (Separately: the
  File Manager in zoneweaver-agent + the UI is for headless agents — a
  different thing; the scenario deserves its own consideration.) This needs to be looped in with the SHI/ICBINS stuff

- [ ] **Application profiles: SHI comparison** —
  revisit the external-apps mapping UX against HOW SHI HANDLES IT
  during Wave 3's SHI source read;  This needs to be looped in with the SHI/ICBINS stuff
- [ ] **Application profiles: federation roaming** —
  once federated, roam the profile across reinstalls/device migrations.

### Wave 2 -- Application Launcher Focus

- [ ] **Console/connection matrix** (supersedes the old "no-VNC handling"
  polish note). Two families per machine:
  - EMERGENCY consoles (hypervisor/host-side, no guest IP needed): zlogin
    (host shell) · QGA execution · VNC via `zadm vnc` (NEVER a direct
    connection to the guest IP) · VRDE (vrdp on Mac/Windows; Linux also
    supports VNC VRDE) · Serial (zlogin-like) · SSH via the provisioning
    network when one exists. VBox on Windows/Mac has NO emergency VNC —
    VRDE is its emergency door.
  - DIRECT connections (to a detected guest IP): RDP · VNC · SSH — each
    with TWO doors: normal click = open in the browser with the existing
    viewers (noVNC / IronRDP / ssh terminal); right-click = open the
    user's default/mapped local application for that protocol, passing
    IPs/passwords (the hwa:// path in aggregated mode).
  - Options GATE on evidence: an address detected or present in the
    provisioning configs — gated-off entries are normal.
  - The matrix is not fully articulated yet — flesh it out at build time;
    entries may be missing.
- [ ] **hwa:// app-launch from AGGREGATED mode** (UI + hyperweaver-agent) —
  noticed with hyperweaver-server fronting 2 zoneweaver-agents + 1
  hyperweaver-agent in ONE pane: when the USER'S OWN machine has
  hyperweaver-agent installed, the aggregated UI should offer the same
  open-external-application actions Direct mode allows, by calling the
  locally-registered `hwa://` protocol handler — browser hands off to the
  local tray app, which launches the user's configured/mapped application
  with its configured arguments (params interpolated per the Part 7
  mapped-app rule). Rides the SHIPPED `hwa://` handler; mappings live in
  the agent's config yaml.

### Wave 3 -- Tour (hyperweaver-ui, after ICBINS)

- [ ] **Tour shipped** — LedFx-style guided tour, a specific tour on each
  page, highlighting what can be clicked and done. Rule: not before ICBINS
  is done.

### Wave 4 -- TLS/PKI/Replication/Conversions/Extra Storage Options

- [ ] **Agent certs/PKI (ACME/LE)** (zoneweaver) — cert automation for the
  agent's own endpoint; SSLs come before replication. The zrepl transport
  needs a cert authority either way — reuse D12's installer-seeded-CA model
  or ACME, pick here.
- [ ] **Replication between zoneweaver agents (zrepl)** — trust fabric
  FIRST (TLS certs + SSH key exchange between agents); then zrepl job
  management, per-zone/dataset replication jobs, status feed.
- [ ] **Machine convert bhyve ↔ VirtualBox** (zoneweaver + Go) — qemu-img
  disk conversion + config translation; the VBoxManage half lives in the Go
  agent; rides the peer fabric for cross-host moves. The template halves
  (zone→.box and VBox→OVF→.box) already exist on both agents — conversion
  builds on that shape.
- [ ] **Replication management UI + conversion tracker** (UI) — consumes
  the two shapes above; one tracker tool, built adjacent.
- [ ] **Network storage: iSCSI / NFS / SMB** (zoneweaver) — COMSTAR
  targets, sharenfs, sharesmb management; UI panel follows the wire. No
  shape dependency, can run parallel.
- [ ] **Notifications** (server + UI) — mail on critical issues/reboots;
  browser notifications for pending actions. Parallel. Toast notifications for things like provisioning tasks or long running tasks like box download or critical issues. in browser notifications should they accrue and be accessible via navbar thing like how home assitsant handles notifictions

### Wave 5 -- Create-Provisioner page (hyperweaver-ui)

Author/fork provisioner packages in the browser (spec: Part 9
§Create-Provisioner).

- [ ] **Authoring transport settled via the sync** — the mandatory FIRST
  act when this wave starts: browser-assembled tar.gz through the EXISTING
  import-upload wire vs an agent-side draft workspace (new endpoints). No
  decision needed until then.
- [ ] **Create-Provisioner page shipped.**

### Wave 6 -- Performance and Auditing

- [ ] **Data-retrieval speed re-measure** — UI-side initial-load behavior
  for the Hosts and VM pages, re-measured now the agent-side speedups (auth
  cache, per-datatype storage, bounded queue scan) are deployed. Key-format
  note that outlived the shipped work: zoneweaver API keys are
  `hw_<key_id>.<secret>` — old keys invalid after that upgrade, re-issue
  per consumer.

- [ ] **Auth-hardening residuals** (hyperweaver-server) — deliberate
  deferral: httpOnly-cookie token transport OR short-access+refresh model
  (transport change, ripples through AuthContext/axios); per-session
  revocation granularity (`jti`/`sid` blocklist — today
  `tokens_valid_after` kills ALL a user's tokens); single-flight the OIDC
  token refresh (parallel near-expiry requests under rotation can
  double-spend a rotating refresh token). Already FIXED, do NOT redo:
  provider-name in `federated_credentials.provider`; HKDF-derived session
  secret + `session.regenerate()` at all three login boundaries;
  `rolling:true` session expiry; invite-exempt registration gate.

- [ ] **500-line file splits** (all repos) — All files should never exceeed 500 lines.
  This does not mean go out of your way to do this, but make sure any new files, if you touch them, you split them properly, but when you do this make sure the user is aware!
  hyperweaver-agent: DONE — full sweep, zero Go files over 500
  (34 split: 33 subagent pure-moves + settings-schema/server refactors).
  Other repos still open; the touch-a-file-split-it rule stands everywhere.

### Wave 7 -- Allowing Always On

- [ ] **NAT'd agent reachability** — agent-initiated outbound channel
  the Server brokers; console viewing rides the existing WS console-proxy;
  presence + async task resume; BoxVault-style sharing ACLs (see Part 6
  §NAT). *Unlocks: managing machines behind NAT.*

### Medium distance away ideas

- [] ** A Succesful test where a Moonshine User, is authed via auth server, and is able to download a private box from boxvault under the org(s) in which they are allowed to download that resouce, and then if the user needs any Assets like the Domino Download binaries, we will have Armor gated on OIDC, and we could, if input artifact/downloads have to be included via auth means, users can stil put in their own urls and do a basic auth downloader, but if they are authd with a Armor server that s also authed and they ahve accepted the terms before hand, it would mint them a long lived token that would be stored in their session such that the downoload token could be used during the ansible play (or a shell play if we are supporting the env ars correctly) so that they don't have to pregenerate and paste a secret to access a downloads server we control. It would then be nice to extend that to developers to be able to authenticate with github which would allow them to either select the releases available for that project it applies to so it can download any fo the private artifacts they have gated

- [] **Federation with the Private Provisioner Catalog via OIDC integration** --
- [] **Federation with the Assets servers like Armor via OIDC integration like we have implemented for BoxVault and Hyperweaver** --
- [] **Federation with the Github to allow the ansible scripts in the provisioners, by setting a key in the secrets for the play that allows them to download the release artifact** --
- [ ] **Standardize All Current Known Provisioners** --
  - startcloud_generic_provisioner -- Poster Child - However Provision.yml should be toyed with a bit
  - moonshinedev_provisioner_private -- Mostly done - Provision.yml needs further tuning/Hyperweaver-UI issues to address
  - switchboard_provisioner -- Needs to be revsisted
  - VagrantProvision -- contains more of a method do deply different types of machines
  - hcl_domino_additional_provisioner -- Needs to be Rigoursly tested
  - hcl_domino_standalone_provisioner -- Needs to be Rigoursly tested
  - hcl_voltmx_go_provisioner (do not invest any time in)

### Ideas and Far Future Items

- [ ] **Platform plugin system** (all repos) — the document's `plugins:`
  key is RESERVED for it; old content rides inert. Future project, no
  design yet. Mix it with the next issu

- [ ] **The Go-server-port decision** — port the Hyperweaver Server to
  Go, or stay Node. Deliberately LAST: both agents implement the same v1
  API regardless, and the decision is better informed once aggregation +
  the outbound channel exist. If Go: shared codebase with the Go agent, one
  binary flipping Agent vs Server/aggregator mode by config. If too costly:
  stays Node. *Unlocks: the one-cross-OS-binary story.*

- [ ] **Run-sequencing v2 — mixed-order steps across sections** — SHELVED;
  the standing intent is to eventually get to a better stepping system.
  The full design options live in `hyperweaver-run-sequencing-ideas.md`
  (kept alive for this); lead candidate = a top-level `run:` list of
  sections + `sync`/`syncback` reference steps. When unshelved it goes to
  the sync as a document-FORMAT question binding both agents, the UI
  editor, and the star template.

- [ ] **Document-format restructure aspirations** (per-playbook roles etc.)
  — recorded aspiration only, revisit as its own project.

- [N/A] **Checkpoint-while-running** (zoneweaver-agent) — UPSTREAM —
  bhyvectl --checkpoint (state snapshot while RUNNING; suspend/resume
  itself shipped). The OmniOS machinery is HIGHLY experimental upstream —
  do not test, do not build; wanted only once upstream stabilizes. A
  hypervisor issue we cannot fix.

---

## WORKING RULES (W) — NOT SUGGESTIONS

- **W1.** No multiple-choice modals — ask in plain text.
- **W2.** Subagents must cite sources; the lead or the user will verify;
  never blindly trust the sources or the code written.
- **W3.** Prefer code over docs (docs can be stale).
- **W4.** Full-file reads, no grep on the assistant's own initiative. **A
  summary or a memory of a file is NOT the file** — re-read the source IN
  FULL before editing it (post-compaction especially); for a ported file,
  re-read the source it was ported from.
  - Go↔base pairing map (which base source a ported Go file re-reads):
    machines/create_exec.go ↔ ZoneManagement/ZoneCreation{Controller,Helpers}.js + TaskManager/ZoneCreationManager/*(+ Hosts.rb §virtualbox for VBoxManage vocabulary only) ·
    machines/provision_exec.go ↔ TaskManager/ZoneProvisionManager.js ·
    machines/hostdoc.go ↔ lib/ProvisionerConfigBuilder.js + ProvisioningOrchestrationController/utils/TaskCreationHelper.js ·
    server/machines_provision.go ↔ ProvisioningOrchestrationController/* (Pipeline/Sync Controllers, utils/{TaskChainBuilder,ValidationHelper}.js) ·
    machines/templates.go ↔ TaskManager/TemplateManager/DownloadExecutor.js ·
    sshrun/* ↔ lib/SSHManager.js ·
    the document contract ↔ core/examples/Hosts.yml + templates/Hosts.template.yml + the VagrantProvision .j2.
- **W5.** The assistant hands over shell commands; the user runs them.
- **W6.** ALL commits in ALL repos use `fix:` — releases only ever bump patch.
- **W7.** NO content hashes in build filenames, ever, and no SW
  cache-version bumping — stale-cache-after-deploy is accepted and handled
  by clearing the browser cache.
- **W8.** Batch changes into combined releases; don't ship small fixes alone.
- **W9.** Do not create an Army of Sub Agents — only ONE subagent, with the user's explicit permission; you may ask for more, but unless the user explicitly asks, never more than one. If they just say yes, it is one; for more they have to say a number, otherwise it is ALWAYS just one.
- **W10.** No lint or security suppressions, ever — every finding is fixed
  at the cause, never silenced.
- **W11.** When the user dictates a new rule in any session's chat, that
  session IMMEDIATELY records it in this file — working rules here in Part
  2, contracts/decisions in Part 4 — transcribed faithfully, zero
  additions, zero softening, zero invented escape hatches. A rule that
  lives only in chat is lost at the next compaction.
- **W12.** **NO NEW COMMENTS IN THE CODE.** Comments are causing massive
  token bloat and making files hard to read. If anything should be
  commented, the three AIs agree on a file to store random comments in.
  Exceptions ONLY: JSDoc-worthy, swagger-worthy; the Go agent is a little
  more lax because its documentation system is not chosen yet. Otherwise
  NO NEW COMMENTS IN THE CODE. NO inline comments at all — only JSDoc and
  swagger comments are supported. Any comment ENCOUNTERED in a file being
  worked on gets removed right there; but never search files just to
  remove comments.
- **W13.** **NEVER underscore-name variables.** Either use the variable or
  lose it. Library-imposed params (req/res style): use them in a log or
  somewhere real, or `void` them — never rename to `_`.
- **W14.** When asked for a commit, the AI gives the commit MESSAGE only —
  never `git add`/`git commit` command lines. The user runs git.
- **W15.** The AI is NEVER an author: no Co-Authored-By / Generated-with
  trailers or AI attribution in commit messages, PRs, or anywhere else.
- **W16.** NO minimal fixes, NO quick fixes — the CORRECT, properly-done
  solution every time. Quick fixes cause more problems than they solve:
  fix at the root, adapt every caller, delete what goes dead, update every
  comment/doc the change touches to the full new truth. Completeness and
  correctness outrank diff size.
- **W17.** Rules are written as rules — no author names, no dates, no
  "(name ...)" attributions, no change-stamps in rule text, anywhere.
- **W18.** 500-line file splits are MECHANICAL code motion only: move whole
  code units (functions, constants, whole classes) VERBATIM into a module and
  re-point importers. Anything that cannot be split that way — all-export
  files, class files that would need method-to-delegator rewrites, a single
  handler whose inline swagger alone exceeds the limit — is FLAGGED to the
  user and LEFT ALONE, never worked around creatively. A split never changes
  the API/wire shape, a function signature, or runtime behavior. It must be
  flagged, not invented around.
- **W19.** Documentation lives WITH the code it documents. Swagger/JSDoc stay
  inline at their handler/function — never moved to a reference file or a
  docs-only file, never `$ref`-componentized into a central schema file to
  shrink a file (that detaches docs from code and defeats the point of inline
  swagger/JSDoc). NO new files are created except genuine code splits (real
  code relocated into an imported module).
- **W20.** After edits, hand the user the repo's OWN standard format+lint
  verification VERBATIM — no invented variant commands, no smoke tests. The
  npm repos (zoneweaver-agent, hyperweaver-ui, hyperweaver-server) use
  `npm run format && npm run lint:fix`; the Go agent's equivalent is
  `$(go env GOPATH)/bin/golangci-lint run --fix && $(go env GOPATH)/bin/golangci-lint run`
  (gofumpt formatting rides in the lint config). Every repo lints. The user runs it.

---

## REQUIREMENTS (R) — stated intent

- **R1.** Replace **Super.Human.Installer** (Haxe). Haxe is disliked —
  hard, immature libraries, threading issues.
- **R2.** Model the experience on **LedFx**: a background **service**
  running a **web server** + a **tray icon**; managing it **opens the
  user's own browser**.
- **R3.** **Reuse Zoneweaver** rather than greenfield everything.
- **R4.** The *same platform* runs in two environments — locally
  (Mac/Windows → VirtualBox, the Hyperweaver-agent's purview) and on OmniOS
  hosts (→ Bhyve, the Zoneweaver-agent's purview), **each instance managing
  only its own local hypervisor.** A standalone agent is single-host;
  multi-host from one pane is the Hyperweaver-server's job, never a bare
  agent's.
- **R5. No Chromium / no packaged browser / no Electron / no Tauri / no
  embedded webview / no traditional GUI shell.** The UI renders in the
  **user's own normal browser**. Non-negotiable.
- **R6.** Users use **whichever browser they want**; a browser picker is
  acceptable, default preferred unless overridden.
- **R7. No third-party dependency** for remote/relay connectivity — no
  Tailscale, no Cloudflare, no shared external accounts. Self-hosted only.
- **R8.** Heavy existing Node investment is preserved. **Zoneweaver-API
  (→ Zoneweaver Agent) will NOT be ported** — stays Node (rename/extend
  only).
- **R9.** Some users only ever want a **private, local** instance. The
  fully-standalone case — **local auth, no IdP, nothing external** — is a
  **first-class, default** way to run it. Federation (cluster/OIDC) is
  **opt-in and user-driven, never imposed**, and is not a one-time fork:
  any standalone install can opt in later.
- **R10.** **Symmetry** is valued — local and remote share the same
  shapes/components, not two architectures. May be inefficient; easier to
  understand.
- **R11.** Resource awareness: local VMs consume most of the host's
  RAM/CPU; the management layer stays mindful of footprint.

---

## DECISIONS LEDGER (D) — binding contracts, not a journal

- **D1. Peer host-agents, one shared API contract.** Two agents, separate
  codebases/languages, **identical API shape** (the Zoneweaver-Agent OpenAPI
  is the reference spec). Divergence is expressed via **capability flags**,
  never divergent endpoints. Shipped as **Agent API v1** — capabilities
  advertised by the public `GET /api/status`.
- **D2. Agents self-serve the UI for local installs**, and a central
  **Hyperweaver Server** aggregates many agents (cluster/production). This
  resolved the trilemma of {100% local} × {reuse Node, no rewrite} ×
  {symmetry}.
- **D3. Final component set + names** (Part 6). Pattern: **`{family}
  {role}`**. `-weaver` = control plane; `Box*` = box supply chain.
- **D4. The React SPA is its own artifact** — published, versioned build
  artifact (release-please → GitHub Release asset); the Go build needs no
  Node toolchain; Server and Agents embed/serve the *same* artifact.
- **D5. The SPA is dual-mode**: **Direct** (talks to the single agent that
  served it — no Server/proxy in the middle) and **Aggregated** (talks to
  the Hyperweaver Server, which fans out to many agents). Direct mode is the
  point: a standalone user runs with no proxying Server at all.
- **D6. Auth is tiered**: **local auth is the always-available default** —
  the agent's API key or the Server's local account → a local session/JWT.
  **OIDC federation is opt-in**: each control-plane app is an OAuth/OIDC
  client of `authorization-server-private` that logs the user in and mints
  its own local session. The IdP is never a hard dependency of an agent's
  startup or of the API contract.
- **D7. Console is agent-hosted**: the agent serves the console WebSocket
  itself (Direct) or the Server proxies it (Aggregated). Virtualbox VNC support extension isn't extend to Windows or Mac by default, we do have vRDP enabled via IronRDP. We will have Emergency Consoles (ie zlogin, serial, vnc via framebuffeer(ie bhyve zones omnios) and vrde rdp (vbox), and then we have the RDP and VNC to the client and ssh to the client via the browser , then we also allow the abililty to lauch a application at the host level(hyperweaver-agent only))
- **D8. A joined local instance has two separate layers — don't conflate:**
  (1) **Viewing** consoles/VNC/shells uses the WebSocket console-proxy that
  already exists (reused as-is). (2) **Reachability** — a NAT'd agent can't
  accept inbound, so the agent establishes the channel OUTBOUND to the
  Server, which brokers it. (2) establishes the channel; (1) rides over it.
  Self-hosted, no third party (R7).
- **D9. The Go agent's provisioning is BASED ON zoneweaver-agent's model**
  — the agent acts ON BEHALF of `Hosts.rb`: native VBoxManage lifecycle +
  box import, agent-driven folder sync and ansible-local over SSH on the
  shared extra_vars contract, granular per-folder/per-playbook tasks with
  `run:` scheduling. It does NOT run vagrant/`Hosts.rb` as its engine.
  **One system for ALL provisioners — no provisioner is first-class**;
  bundled packages are merely included, never catered to by name.
- **D10. The provisioner PACKAGES are reused unchanged** — collections,
  playbooks, templates; `Hosts.rb`/`Vagrantfile` stay inside them for
  standalone vagrant users, but the AGENTS never execute them.
  `core_provisioner` is a git submodule of every provisioner; only
  `startcloud_generic_provisioner` is flattened. Both agents pull base boxes
  from **BoxVault** and run the same Ansible role collections
  (`startcloud_roles`, `hcl_roles`).
- **D11. Aggregation is the Hyperweaver Server's exclusive job; agents are
  strictly single-host.** The backend registry (`/api/servers`), cross-host
  health checks/monitoring, proxy fan-out, and the multi-user/org layer live
  ONLY in the Server — written once, never duplicated into an agent. A
  standalone agent manages only its own hypervisor and serves the UI in
  single-host Direct mode. *(If the Server goes Go, the same Go codebase can
  flip between Agent mode and Server/aggregator mode via config — local
  aggregation becomes a setting, not a separate install.)*
- **D12. TLS-everywhere (shipped on all four repos).** `ssl.enabled` means
  ALL traffic rides TLS: the plain-HTTP port serves ONLY 308 redirects
  (method/body-preserving) to the HTTPS counterpart — no API, no WS upgrades
  on HTTP. `force_secure` (boolean, default true; `server.force_secure` on
  the Server's flat config, `ssl.force_secure` on the agents) is the
  dual-serve escape hatch for redirect-incapable clients — a serving-mode
  toggle, not a shim. Certificate failure degrades to the FULL app on HTTP
  with a loud log — a cert problem never bricks a service. The Go agent's
  server certificate is SIGNED by the installer-seeded STARTcloud CA
  (`ssls/ca` pair from the ssl role; never a bare self-signed leaf;
  operator-provided CA at `ssl.ca_cert_path`/`ca_key_path` wins, generated
  CA is the fallback), and installers import the CA into the OS trust store
  (Windows `certutil` Root, Debian `update-ca-certificates`, macOS pkg
  postinstall `security add-trusted-cert`). Aggregated-mode registry entries
  point at agents' https origins — axios (health poller/REST proxy) follows
  308s but `ws` (console proxy) does not.
- **D13. Settings surface (shipped on both agents + UI).** `GET /settings`
  returns the COMPLETE effective configuration (defaults merged, file wins)
  — NOTHING masked, hidden, or warned about, schema included.
  `GET /settings/schema` (admin auth, proxy-transparent) serves the agreed
  shape: top-level SECTION descriptors `{description, requires_restart,
  properties}`; leaf fields `{type, description, default}` - optional
  `min`/`max`/`enum`; object fields nest `properties` recursively;
  free-form map fields carry `keys` + `values` vocabularies; empty-string
  defaults are explained in the field description. The UI settings editor
  is value-driven from `GET /settings` and DECORATED by the schema
  (enum→dropdown, min/max→constraints, description→help text,
  empty-resolves-to→placeholder) — one code path, unschema'd fields render
  plain.
- **D14. Wire vocabulary + capability gating (shipped on all four repos).**
  The de-zoned Agent API: list `machines`, detail `machine_info`,
  `machine_name` on task/session/terminal rows and in
  operation/notes/tags/ids responses and the GET /tasks filter/sort params;
  bulk body `machines` + skipped[] `machine`; /stats
  `allmachines`/`runningmachines`.
  **Illumos-domain boundary:** zone words stay where they name real illumos
  things — `zlogin`, `zones_service_enabled`, PPT `assigned_to_zones`-family,
  process/interface `zone` fields + `?zone=` filter, task operation VALUES,
  Hosts.yml's `zones` document key, product names in prose. **`zone_id`
  stays** — the hypervisor-NATIVE identifier (bhyve zone UUID); the Go
  agent's equivalent is `uuid` (VirtualBox GUID). **Gating:** the UI gates
  on feature tokens ONLY, never on `hypervisors[]` values. **Token
  registry:**
  - `machine-suspend` — BOTH (reversed from the earlier Go-only rule:
    zoneweaver suspend/resume ship on bhyvectl's checkpoint, statefile
    inside the zonepath, start also restores; EXPERIMENTAL-gated on
    zoneweaver behind `experimental.enabled` (default false — the bhyvectl
    flag is dev-marked; off = 503 + no token + start discards leftover
    checkpoints), unconditional on Go; PAUSE remains Go-only within the
    family — the UI gates the pause control by agent).
  - `machine-create` — BOTH live. NOTE: names a cross-agent capability
    truth, not a wire shape; the two agents' create bodies differ.
  - `services` — zoneweaver: live; Go: NEVER (Manage-surface ruling).
  - `monitoring` — BOTH live; the Go agent always serves realtime gopsutil
    samples and `monitoring.storage_enabled` adds stored history in
    per-datatype database files — responses carry `sampling.strategy:
    realtime|stored` (realtime = single current sample; charts render a
    point/gauge, not an empty history).
  - `processes` — BOTH live: Go has no `zone` field, ignores `?zone=`, and
    on win32 delivers only TERM/KILL signals.
  - `host-power` — BOTH live (the `/system/host/*` power surface: platform
    token on zoneweaver, config-gated `host_power.enabled` on Go).
  - `provisioning` — BOTH live (the cross-agent "this agent provisions
    machines" truth, never a wire-shape promise).
  - `provisioner-registry` — the SHI-format package-registry surface
    `/provisioning/provisioners*` + the registry-driven wizard; live on
    BOTH.
  - `secrets` — the global secrets store `/secrets`; live on BOTH (zoneweaver
    shipped it as a platform token; verified).
  - `artifacts` — config-gated on both, but wire shapes differ until the
    artifacts convergence — the UI's Installer Files page therefore gates on
    `artifacts` ∧ `provisioner-registry`.
  - `templates` — BOTH live (Go's box-template registry is a platform token
    there; config-gated `template_sources.enabled` on zoneweaver).
  - `machine-modify` — BOTH live. `machine-snapshots` + `machine-screenshot`
    — BOTH live. `provisioning-profiles` — REMOVED (profiles ripped out;
    design doc §9).
  - Manage-tab map: Time→`time-sync`, Processes→`processes`, Users and
    Groups→`system-users`, File Manager→`file-browser` (config-gated),
    Services→`services`. **Ruled OUT for the Go agent permanently: services,
    time-sync, system-users** — the token map keeps those three tabs hidden
    on it.
  - `network-spaces` — Go: live (the /network/spaces surface: host-only
    interfaces + DHCP, host-only networks, NAT networks + forwards/loopbacks,
    read-only intnets). **VirtualBox CLOUD NETWORKS (`VBoxManage
    cloudnetwork`) are ruled OUT permanently**; deep DHCP-server option
    tables (per-group/per-VM options beyond server+range) are parked.
  - An agent advertises a token only when the surface actually ships. WS
    upgrades on BOTH agents require `?ticket=` from the authed
    `GET /ws-ticket`.
  - **Console taxonomy: `console[]` carries EMERGENCY consoles only**
    (hypervisor-level, zero guest cooperation) — zoneweaver: `vnc` +
    `zlogin`; Go: `rdp` + `vnc` (vnc only with a usable VBoxVNC module).
    **The machine SSH terminal is the `ssh` FEATURE token on BOTH agents**
    (moved out of `console[]`) — the UI gates the SSH terminal on
    `hasFeature('ssh')`, the zlogin console on `hasConsole('zlogin')`.
- **D15. Multi-tenancy: org-scoped agents and machines (server-side
  enforcement shipped).** The org layer lives ONLY in the Hyperweaver Server
  (D11); agents stay org-blind. Org identity = the org uuid — from the IdP's
  `organizations` claim (scope `openid profile email organizations`) for
  federated logins, from the local organizations table (`org_uuid`, minted
  at create/backfilled) for local logins; one enforcement mechanism, two
  membership sources; NEVER key on org name. Ownership tables (junctions —
  multi-org deliberately not ruled out): `server_orgs` (agent ↔ owning orgs;
  multiple allowed; an agent with NO rows is open to every authenticated
  user of that Server) and `machine_orgs` (machine ↔ orgs, keyed server_id +
  agent-canonical machine name). A machine with NO rows is visible only
  to the agent's owning orgs. Roles: OWNER/ADMIN of an agent-owning org =
  manage host and all its machines; OWNER/ADMIN of a machine-owning org
  (agent not owned) = create/manage/delete THEIR machines only; MEMBER =
  view + consoles + power actions, never create/modify/delete. Enforcement
  is proxy-side: /api/agents/* requests are authorized per path, machine
  and task LISTS are filtered to the caller's orgs for machine-scoped users
  (a deliberate, ruled exception to proxy verbatim pass-through), machine
  creates are stamped with the creator's org (body `org_uuid` wins when the
  creator manages that org, else primary org). Local super-admin bypasses.
  Assignment surfaces: GET/PUT `/api/servers/{id}/orgs` and
  `/api/servers/{id}/machines/{name}/orgs` — self-service: local admins
  always; agent org lists manageable by OWNER/ADMIN of an owning org;
  machine org lists by agent-org managers (who may assign ANY machine on
  their agent, unstickered included) or that machine's own org managers.
  The `/api/servers` registry list is itself org-filtered (unassigned
  agents visible to all; owned agents only to member/machine-holding orgs).
  MEMBER's writable actions are an EXPLICIT allowlist verified against the
  agent route registry (power verbs start/stop/restart/reset/suspend/resume,
  console session start/stop) — never pattern-guessed; the machine DOCUMENT
  (hosts-yml) is manager-only — MEMBER cannot read it (it carries
  provisioning vars/secrets). HOST SHELL (/term family): agent-owning-org
  OWNER/ADMIN only — never MEMBER, never machine-scoped users.
  Machine-scoped users reach id-keyed task/console-session paths via an
  ownership LOOKUP (the Server asks the agent which machine the id belongs
  to before allowing); /stats machine-name arrays are filtered to their
  machines. Machine names are immutable on the Agent API (no rename wire
  exists), so name-keyed stickers cannot orphan. Org-switcher feed:
  `/api/servers` rows and proxied GET machines rows carry `org_uuids` ([] =
  unassigned); local admins/super-admins see full owning lists, everyone
  else only the intersection with their OWN orgs — foreign org uuids never
  leak on shared hosts (managers read full lists via the manager-gated
  assignment endpoints instead). Cross-app: BoxVault access is per-user —
  `/api/boxvault/*` forwards with the LOGGED-IN USER's OIDC access token
  (server-side session stash), BoxVault authorizes org-private boxes from
  the token's claim; NO server-wide BoxVault credential exists anywhere;
  agent box downloads use BoxVault's short-lived signed download URLs handed
  through the Server — user tokens never reach the agent fleet. BoxVault
  URL paths use BoxVault's immutable org SLUG, never the org uuid —
  consumers map Hyperweaver org → BoxVault path via the org's
  external_org_id (= the shared uuid) in BoxVault responses; access tokens
  must carry `boxvault` in aud for BoxVault to accept them (IdP audience
  config).
- **D16. Per-user OIDC login (device flow) is a hyperweaver-agent-only
  surface.** The Go agent is a per-user install and implements RFC 8628
  device-grant login (the sync carries the frozen wire while it builds).
  zoneweaver-agent is a shared-host agent and stays API-key-only in Direct
  mode — its `auth[]` never gains `oidc`, no user access/refresh tokens are
  ever stored on a shared host (D15's user-tokens-never-reach-the-fleet
  rule extends to Direct mode), and per-user/federated access to zoneweaver
  rides the Hyperweaver Server exclusively (D11/D15). The UI gates the
  device-login surface on `auth[]` containing `oidc` — a capability, never
  an agent-type or mode check.

**D-swaggo (parked; full requirements preserved).** hyperweaver-agent's API
documentation moves INLINE with the code (swaggo/swag annotations above
every handler, `swag init` via `go:generate` regenerating the spec at build
time); the hand-authored `internal/apidocs/openapi.json` stops being the
source of truth and is DELETED once parity is proven. ~3,800 lines of spec
prose across ~120 handlers in ~15 `internal/server/*.go` files. HARD
REQUIREMENTS: (1) NO wire regression — diff the generated document against
the hand-authored spec path-by-path and description-by-description before
deleting; the current spec is the acceptance baseline. (2) The serve-time
behaviors in `internal/apidocs/apidocs.go` survive: `info.version` stays the
FROZEN contract line ("1.0.0"), `info.x-app-version` stamps the running
build, the dynamic `servers` block keeps rendering per request. (3) The
deeply-nested schemas are the known swaggo pain point — where annotation
syntax can't carry them faithfully, keep those components as a
hand-maintained fragment merged into the generated document rather than
lobotomizing the prose. (4) swag is a build-time tool only — no runtime
dependency; the swagger UI vendoring at `/api-docs` is unchanged. *(This
supersedes the never-built route↔spec drift-guard test idea.)*

---

## QUESTIONS / OPEN

- **The resource noun → `machines`** (shipped). Neutral shared noun (a
  VirtualBox VM isn't a `zone`). `/machines/*` is canonical on both agents;
  `/zones/*` REMOVED — NO ALIAS. The v1 spec documents `/machines/*` only.
- **Console protocol → VNC first, RDP later.** VirtualBox console serves as
  VNC initially (VBox ships a VNC module) so the UI is single-protocol and
  reuses the Bhyve viewer; RDP/VRDP later as a second console capability.
- **The Go-server-port question → resolved with an aspiration.**
  Zoneweaver-API stays Node — never ported. The Hyperweaver Server SHOULD be
  ported to Go if complexity is acceptable (single cross-OS binary; code
  shared with the Go agent; one binary flips Agent/Server mode by config).
  Fallback: stay Node. Gated on a complexity assessment — sits LAST in the
  main line.
- **Standalone = Agent-only, single-host (Direct mode)**; multi-host needs a
  Hyperweaver Server (D11).
- **What does the agent's `/` serve?** With `ui.enabled` ON, `/` redirects
  to `/ui/`; OFF (headless API-only) serves the old info page. Both correct
  for their mode; retired.

---

## SYSTEM REFERENCE

### Components

| Component | Was | Role | Lang |
| --- | --- | --- | --- |
| **Hyperweaver UI** | (SPA in Zoneweaver `web/`) | React frontend. Served by the Server (Aggregated) or an Agent (Direct). Dual-mode | React/Vite |
| **Hyperweaver Server** | Zoneweaver (frontend/proxy) | Production aggregator/"vCenter": serves UI, user auth, proxies + aggregates agents | Node (→ Go under review) |
| **Hyperweaver Agent** | Super.Human.Installer | VirtualBox host-agent. API + self-serves UI locally. Owns the hypervisor | Go |
| **Zoneweaver Agent** | Zoneweaver-API | Bhyve/OmniOS host-agent — the reference implementation of the Agent API | Node |
| **BoxVault** | BoxVault | Box/template store (self-hosted Vagrant-Cloud equivalent); already an OIDC client | Node + React |
| **BoxPress** | vagrant_box_template_creator | Box/template BUILDER (Packer pipeline) feeding BoxVault; future UI | — |
| **authorization-server** | authorization-server-private | OIDC IdP (Spring Boot/Groovy/PostgreSQL); federation only | Spring |
| *Cardboard* | — | Parked name for a future idea | — |

**Name families:** `-weaver` = control plane (Hyperweaver UI/Server/Agent +
the legacy-named Zoneweaver Agent — role suffix disambiguates, prefix
carries lineage); `Box*` = box supply chain (BoxPress builds → BoxVault
stores → agents consume at provision time).

**Repos:** `hyperweaver-ui`, `hyperweaver-server`, `hyperweaver-agent`,
`zoneweaver-agent` (NOT bare `zoneweaver`), `hyperweaver-docs` (Jekyll),
`boxpress`; BoxVault + authorization-server-private unchanged.

### Topology

```text
                         authorization-server  (OIDC IdP — federation only)
                                   ▲  (tokens, only when federated)
                                   │
     ┌─────────────────────────────┴─────────────────────────────────┐
     │                  Hyperweaver Server (Node)                    │   AGGREGATED MODE
     │     serves Hyperweaver UI · user auth · proxy · aggregates    │   (cluster / production / Debian)
     └───────┬───────────────────────┬───────────────────────────────┘
             │ Agent API             │ Agent API
             ▼                       ▼
   ┌───────────────────┐   ┌───────────────────┐
   │ Hyperweaver Agent │   │  Zoneweaver Agent │
   │ (Go) VirtualBox   │   │  (Node) Bhyve/    │
   │                   │   │  OmniOS           │
   └─────────┬─────────┘   └─────────┬─────────┘
             │                       │
        VirtualBox              Bhyve zones
             │                       │
             └──── base boxes ◄── BoxVault ◄── BoxPress (Packer)
             └──── software install ◄── Ansible (startcloud_roles + hcl_roles)

   DIRECT MODE (100% local, no IdP required):
   browser ──► Hyperweaver Agent (serves its own Hyperweaver UI + API + console WS)
```

### Deployment topologies

| Topology | Who serves UI | Auth | Notes |
| --- | --- | --- | --- |
| **A. 100% local standalone** | the Agent itself (Direct) | local API-key/account, no IdP | The R9 case. One install, tray, opens browser, manages local hypervisor |
| **B. Central cluster / production** | Hyperweaver Server (Aggregated) | OIDC (+ local fallback) | Server registers many agents, proxies UI/console. The "vCenter" |
| **C. Federated NAT'd node** | Hyperweaver Server (Aggregated) | OIDC + sharing ACLs | Main-line step 3. The NAT'd agent dials OUTBOUND; console-viewing rides the existing WS proxy |

Symmetry (R10): components are identical across A/B/C — only topology and
enabled capabilities differ.

### The Agent API contract (v1, SHIPPED)

One spec, two implementations. The Zoneweaver-Agent OpenAPI is published as
**"Agent API v1"** — `info.title: "Agent API"`, `info.version: "1.0.0"`
(contract version, frozen; the implementing app version rides in
`info.x-app-version`, release-stamped). Served at `/api-docs/swagger.json`;
`openapi.json` published as a release asset. UI client + Go types generate
from that artifact so the agents cannot drift. Identical for both agents:
resource lifecycle (list/get/config/create/start/stop/restart/delete/clone/
modify), task queue (list/detail/output/cancel/stats), console sessions
(start/info/stop + WS), settings, version. Divergence via capabilities: the
public `GET /api/status` advertises `role` (agent|server), `hypervisors[]`
(bhyve|virtualbox), `console[]`, `auth[]` ({apikey, local, ldap, oidc}), and
`features[]` — kebab-case tokens derived from *(platform support ∧
config-enabled)*. Direct-mode role model: API keys carry `role` ∈ {admin,
operator, viewer}; central method+path policy enforced at auth (viewer =
read-only; operator = +operations/consoles/ws-ticket; admin =
+keys/settings/host-power/accounts). Last-active-admin-key deletion refused
(lockout guard).

### Auth model (tiered, never IdP-mandatory)

1. **Local tier (default, offline-capable):** the agent's API key
   (bootstrap-first-key) or the Server's local account → local session/JWT.
   Works with NO IdP.
2. **Federation tier (opt-in):** each app is an OAuth/OIDC client of
   `authorization-server-private` (auth-code + PKCE); the app mints its OWN
   local session from the result. Unlocks SSO + BoxVault sharing.
3. **Discovery:** `auth` is a capability; the UI shows local login or
   redirects accordingly.
4. **Desktop login (federated):** the Go agent registers its own `hwa://`
   protocol handler (shipped) to complete the browser→app OIDC handoff —
   only when federating.

**Hard rule:** the IdP is not a dependency of an agent's startup nor of the
API contract.

#### Shipped auth mechanics — binding for all future auth work

- **OIDC tokens live server-side ONLY** — `req.session.oidc` on the Server;
  never in the app JWT or localStorage (BoxVault's token-in-JWT model was
  security-reviewed and REJECTED: XSS → IdP refresh-token theft). The
  browser holds only the app JWT, handed off post-OIDC via the URL
  **fragment `#token=`** (never a query param). The session stash is bound
  to the requesting user (`oidc.userId` must match the JWT's user).
- **PKCE (S256, session-bound `code_verifier`) supersedes `state`** — do not
  hand-roll `state`/`nonce` for the code flow (RFC 9700 / OAuth 2.1).
- **Account linking:** an OIDC identity links to an existing account only
  with `email_verified === true`; subject-based linking preferred.
  Credentials store the FULL provider identity (`ldap` / `oidc-<name>`,
  `<name>` = the configured `oidc_providers` key) — per-provider subject
  namespaces prevent cross-provider collisions; `users.auth_provider` keeps
  the base type. (Do NOT re-normalize to base `oidc` — deliberately
  reversed.)
- **SLO / revocation:** app JWTs stay stateless but revocable —
  `users.tokens_valid_after` set on EVERY logout and admin deactivation; jwt
  strategy rejects older `iat` and `is_active === false`. Logout is
  two-scope: *federated* (revoke the OIDC grant + RP-initiated end-session —
  ends IdP SSO) vs *local* (`local:true` — app JWT only; IdP SSO survives).
  Back-channel receiver: public `POST /api/auth/oidc/backchannel-logout`
  validates the `logout_token` (JWKS/aud/iss/events, no-nonce), correlates
  via the federated-credential subject, revokes.
- **Registration:** `authentication.local_registration_enabled` gates local
  SELF-SERVICE signup only — first-user/super-admin bootstrap AND
  invite-code registrations are always allowed; when off, the UI routes
  Register → IdP via `?register` (→ `prompt=create`).
- **IdP constraints:** NO Dynamic Client Registration — each new OIDC client
  = IdP `application.yml` edit + restart. `client_credentials` IS enabled
  (the M2M path). DPoP/PAR/device-grant supported but not on. Issuer is
  dynamic per-hostname — build to discovery
  (`.well-known/openid-configuration`), not today's payload.

### Console access

- A browser cannot speak raw VNC/RDP — there is always a WS bridge. "Direct
  vs proxied" = where the bridge lives.
- **Direct:** the Agent hosts the console WS itself. **Aggregated:** the
  Server proxies it. Same client, different URL.
- **VirtualBox VNC-capability detection:** parse `VBoxManage list extpacks`
  — each pack block's `VRDE Module:` line names its backend (`VBoxVNC` =
  VNC pack, `VBoxVRDP` = Oracle RDP) and must pair with `Usable: true`.
  Pack presence alone proves NOTHING (a live Oracle pack can report an
  EMPTY `VRDE Module:`). Which module VMs use: `VBoxManage list
  systemproperties` → `Default VRDE ext pack` (set via `VBoxManage
  setproperty vrdeextpack VNC`); per-VM: `--vrde on` + VNC properties. The
  agent advertises `console: ["vnc"]` only when a usable VBoxVNC module
  exists — advertise only what actually works.
- New scope vs SHI: SHI never rendered the VBox console in-app; in-browser
  VirtualBox console is an enhancement.

### Provisioning engine (Go agent)

Governed by the design doc + D9/D10. The agent owns the VirtualBox
lifecycle natively (no vagrant), renders documents from packages, syncs
folders, runs methods in document order. SHI feature-parity checklist
(must-cover): multi-server create/configure/clone/delete/destroy ·
provisioner types incl. schema-driven custom · provisioner import/version
management · role selection + installer/fixpack/hotfix file assignment +
hash verification + file cache · lifecycle start/stop(force)/suspend/
provision/sync/destroy · status polling + external-shutdown detection ·
live console + provisioning progress · open welcome URL in chosen browser ·
open SSH/terminal/dir/FTP · prerequisite detection (VirtualBox/Git) +
version display · settings/preferences · secrets · VM details · safe-id
(Domino cross-certify) · auto-updater · rsync/SCP sync handling.

### Frontend delivery

SPA in its own repo, release-please → `dist/` → versioned GitHub Release
artifact. Server (Node) serves it statically; **Go embeds via `embed.FS`**
(no Node in the Go build). The SPA couples to an `/api/*` contract
(`/api/auth/*`, `/api/servers`, `/api/zapi/*`, console WS) — whatever hosts
it implements that surface: the Server fully, an Agent as a thin
single-backend Direct-mode shim. Dev uses Vite against a live agent.
Server repo conventions: TWO divergent config templates — repo-root
`config.yaml` (dev) and `packaging/config/production-config.yaml` (canonical,
installed to `/etc/hyperweaver-server/config.yaml`) — **every new config key
goes in BOTH** or prod silently lacks it. Swagger scans `controllers/**`,
`routes/**`, and `models/**` — swagger blocks live WITH their handlers (W19),
including handlers split into subdirectories. The SPA's canonical login route is
`/ui/login` (bare `/login` redirects; OIDC callback `/ui/auth/callback`,
reading `#token=` from the fragment).

### NAT'd-agent reachability (main-line step 3, the mechanism)

Problem: a NAT'd / intermittently-online agent can't accept inbound, yet
the Server (and authorized users) must reach it. Mechanism: the agent
establishes the channel OUTBOUND to the Server, which brokers it; the
Server then reaches the agent over that held-open connection (outbound 443
traverses NAT; self-hosted, R7). Viewing rides on top via the existing WS
console-proxy — no new console code. Offline/async: presence = channel
connected; long ops are async tasks (resume/report on reconnect); live
console only while online. Authz: OIDC token + a sharing/ACL model
(BoxVault-style orgs/invitations/requests). To the UI, a channel-reachable
agent is just another registered backend — only the transport differs.

### Key flows

- **Login (federated):** browser → IdP (auth-code + PKCE) → the app mints
  its own local session. **Local install:** local API-key/account, no IdP.
- **Local VM lifecycle:** UI form → the Go agent builds the VirtualBox
  config and runs sync + ansible-local ITSELF from the host document
  (zoneweaver's model; `Hosts.rb`/vagrant are not in the agent path).
- **Remote Bhyve:** same UI/contract → Zoneweaver Agent creates the zone
  natively + its own provisioning; VNC/zlogin over WS.
- **Box pull / software:** both agents pull base boxes from BoxVault and run
  `startcloud_roles` + `hcl_roles` — hypervisor differs, software-install
  layer is identical.
- **Sharing:** one OIDC identity spans Server + agents + BoxVault →
  box/config sharing.

---

## SHI NOTES (verbatim reference for ICBINS)

I have the latest development of SHI open right now and I want to describe
what I am seeing

When it initially opened, it said something to the effect of detecting
evnvironment, and the windows menu bar at hte top was dark themed with the
apps name and version, the footer had a few bits of details such as the OS
Microsoft WIndows 10 Pro, if it was x86_64 or Arm, how many cores, Ram, If
vagrant was installed and what version, if Vbox was installed and what
version, and git too, all that information appeared at the bottom as
initialized

it then showd me the main page, which wa an overview of all of my vms, it
had a search bar and a count of servers, in the upper hader had the logon
ht left, the name htne the servers, how i works, about, support and
settings, and to the far right in the header it had a update now.

The vms had which roles they had and which provisioner and version, and how
many system resources were allocated to, along with start, console, file
menu, commnad line, delete, clone and settings

at the bottom it shwos vagranat machiens and virtualbox machines (as this
number may mismatch if user manually started/deleted/created a vm manually)
it has a refresh button tha would scan the two and then a button that would
open up virtualbox.

How it works too them to a simple static page that showe them the various
technologies, the ABout page was similar

Support did have a open log file folder and a create a new issue on github
button, and then there was the settingts page, with its Browser detection,
Default NIC detection, file sycnhronization defaults, various things like
keep servers running on application exit, so on and so (look at the SHI
code!)

There was a Manage Provisioners, and a Global Secrests and INstaller Files,

we do NOT want to treat hcl_domino_standalone_provisioner and
hcl_domino_additional_provisioner as their own things that extend furhter
and further, I would much prefer that we use one ssytem for all
provisionres. Look at the custom provisioner stuff in SHI and also look at
hte provisioning system in zoneweaver-agent, they should be fairly
similar/familiar to each other.

So I guess what I am wanting to provide is both worlds here, one the very
opinionated, here are these 2 VM types yoou can spin up and 3rd custom
type, but have it running on the hyperweaver system. So in Direct Mode, we
want to have a 3rd toggle that would be used for the I can't believe its
not SuperHumanInstaller mode. Now thats not neccessarily what we want for
this

We also need to make sure that we have the Swaggger or equivalent
documentation page loading lik zoneweaver-agent provides, note that if this
is used as part of a hyperweaver-server agent node, then the documentation
for the API (not general documenation) may be on a slightly different url.

An Idea, once we get to the URL Protocol handler for the application, maybe
we could have a button that just says login or it even tries to auto open
the protocol handler (and if they hadn't accepted it before in the browser
they would accept it and continue and then not be prompted int hte future,
and htat proto handler would then act as if the user click the tray icon to
open the browser with the token that would allow login, and voila, even
more seamless local login

Maybe something else we can do is wonce we have hte proto handler scheme,
is that if a user wants to assign Putty, or Kitty, or their other
application, we can have a applications page that would allow them to
create/set application arguments to the specific application in order to
ssh to things like VMs or open specific apps like winscp over filezilla,
and it would work by calling our go agent tray via the proto handler and it
would launch the repsective apps. These details would be stored in the
configuraiton yaml file for easy app portability/configuration (and maybe
once they are federated into a cluster we can save their profile and auto
apply it on reinstalls/device migrations etc)

*(Clarification: when a user opens something with an external application
they have MAPPED, it must launch via CLI with its configured parameters —
password and IPs interpolated into the params. Protocol handlers like
sftp:// stay as the other door; the mapped-app path is in ADDITION, not a
replacement.)*

---

## PROVISIONING CONTRACTS (absorbed from the deleted design doc; standing rules only)

### Concepts

- **Provisioner (package):** a versioned directory shipping everything
  needed to install a software stack — form definition, document template,
  ansible content.
- **Provisioning document:** one machine's Hosts.yml host entry (settings /
  zones / networks / disks / provisioning / folders / vars / roles). The
  package renders the document; the document drives the agent. The section
  keeps the name `provisioning:`.
- **Two usage modes, no third:** (1) **Ad hoc** — a hand-built machine stub
  (any composition: ISO, existing disk, template clone, diskless/PXE), no
  provisioning; wire: POST /machines without a `provisioner` ref — the
  request body IS the document. (2) **Packaged** — pick a provisioner, fill
  its form, the package does the rest.
- **Document format: UNCHANGED, ever** — no restructures, no key renames;
  every consumer depends on the current shape. (The per-playbook-roles
  restructure is a recorded aspiration only — see the parked list.)
- **Provisioning profiles: REMOVED.** Never rebuild them — package-less
  provisioning is incoherent (no package ⇒ no form, no content).

### THE DOCUMENT IS THE PROGRAM (binding — EVERY section)

Agents EXECUTE the document; they never edit, reorder, filter, normalize,
dedupe, or inject. `roles[]` run in LIST ORDER with per-entry
vars/when/tags and duplicates VERBATIM; `vars` passes through WHOLE into
extra_vars and script env (never filtered, renamed, or coerced);
`folders[]` syncs in LIST ORDER with every per-entry key honored;
`pre_tasks`/`post_tasks` ride verbatim; UNKNOWN KEYS SURVIVE round-trips.

**Execution order — no phases, no agent-owned sequences, EVER.** The run IS
the document's `provisioning:` section executed AS WRITTEN: methods run in
the order their KEYS APPEAR; entries within each method in LIST ORDER. For
ansible: groups in list order, each group's `local[]` then its `remote[]`
per its OWN lists — one chain, never "all locals then all remotes"; the
provisioned-state stamp rides the overall LAST entry of the whole run; run
directives filter per entry. Folders are the OUTERMOST bracket — sync →
`pre[]` → methods in document key order → `post[]` → syncback; hooks live
inside `provisioning:`, so inside the folders bracket. (True interleaving
of syncs BETWEEN steps is shelved — returns only with new document syntax,
never as agent invention.) Where a feature's sequencing is unstated, it is
the document's order — ask in the sync before inventing ANY structure. We
cut vagrant's binary AND its rigidity: the sync-then-provision straitjacket
is not parity, it is what parity replaced.

### Package anatomy

```text
<family>/<version>/
  provisioner.yml                      # REQUIRED — manifest
  templates/
    Hosts.template.yml                 # REQUIRED — true Jinja2 → renders a document
  provisioners/
    ansible/                           # OPTIONAL generator machinery
    ansible_collections/<ns>/<coll>/   # vendored collections, pinned per version
    scripts/                           # optional package-internal scripts
  core/ + Vagrantfile + version.rb     # optional DRIVER — agents never run it; carried
                                       #   so plain-vagrant users can consume the package
  ssls/  id-files/  installers/        # optional, per-package
```

- Family manifest `provisioner-collection.yml` = `{name, description}`;
  synthesized when absent.
- **Platform contract is only:** sync `folders[]` as listed, run
  `playbooks[]`/`scripts[]` as listed. Generator machinery is a package
  convention, not platform contract. Simplest valid package = manifest +
  template.
- **Versions are immutable.** Import refuses collisions; new versions land
  beside old; delete refused while any machine references the version.
- **Artifact contract (provisioner CI):** version source of truth =
  provisioner.yml `version:` (release-please managed; build refuses on
  mismatch). Release archives are REGISTRY-SHAPED (`<name>/<version>/…`).
  Each release: immutable `<name>-<version>.tar.gz` + mutable latest alias
  (seed use only — catalogs and pins use versioned assets exclusively) + a
  `<asset>.sha256` sidecar per asset.

### Manifest — provisioner.yml

Top level: `name, version, label, description, author`. Under `metadata`:
`roles: [{name, depends_on: []}]` (advisory ordering hints);
`configuration: {groups, fields}` (the field DSL); `presentation: {}`
(RESERVED — ICBINS extras land here, never as schema revs); `forked_from:
{name, version, url?, ref?}` (OPTIONAL, DELETABLE provenance, informational
only); `id_files: {safe_id_dir, keep_original_name}`. Role variables are
NOT in the manifest — single source of truth is each role's
`meta/argument_specs.yml`, derived at import into a `role-specs.yml` cache.

#### Field DSL

A field's `name` is the EXACT Jinja2 context key; answers stay a flat map
(multiselect delivers a native list).

- **Types (closed set of ELEVEN):** `text`, `textarea(+rows)`, `number`,
  `checkbox`, `select` (scalar or `{value,label}` options, or
  `options_source: networks|datastores|hosts|images` live pickers),
  `multiselect`, `password` (masked, log/export-redacted, no default,
  optional `generate:{length}`), `fqdn`, `ipaddr(+version)`, `cidr`,
  `path`. Unknown type = IMPORT ERROR (fail-closed).
- **Groups:** ordered `[{name, label, help?, advanced?, show_if?}]`;
  `advanced: true` collapses behind ONE "Show advanced settings" toggle.
  No tabs in v1.
- **Conditionals:** `show_if` on field or group. CLOSED grammar, no
  expression strings: map = AND; scalar → equals; `[list]` → IN; `{not:}`;
  `{gt|gte|lt|lte:}`; `any: [map, map]` → OR. Operands = earlier-declared
  fields + role-enable flags `<metadata.roles[].name>_enabled` VERBATIM.
  Hidden field ⇒ answer not collected, name ABSENT from render context.
  Evaluated live in the UI and authoritatively on the agent; one shared
  test-vector file keeps both evaluators honest.
- **Validation:** `validate: {min,max | min_length,max_length | pattern +
  REQUIRED pattern_error}` (regex = JS/Go-common subset). `required`
  enforced only while visible. `immutable: true` = read-only after first
  provision. Runs in three places from one source: import-time schema lint
  (fail-closed, refusal echoes the author's YAML with inline annotations),
  UI live (never authoritative), agent authoritative pre-render (422 with
  `{FIELD: message}`).
- **Defaults** merge before conditional evaluation. **I18n:** none in v1.
- **Derived interop:** at import the agent derives a cached `schema.json`
  (JSON Schema 2020-12) per version beside role-specs.yml. Authors never
  write JSON Schema.
- **Growth rule:** grammar and types grow only by deliberate closed
  additions — never string expressions, never computed defaults.

### Answer migrations (FROZEN, all parties shipped)

Optional `answer-migrations.yml` beside provisioner.yml in the NEW
version's dir — package-authored, never derived; absent = no transforms.
Shape: `from: {"<old-version>": {renames: {old_field: new_field}}}` —
direct per-source-version maps, NO chaining; unlisted source versions pass
through untouched. Applied ONCE by the agent whenever answers recorded
under version A render against version B: renames move values (existing
new key wins), everything else verbatim, new fields take DSL defaults.
RENAMES ONLY — if it ever needs more, the feature dies instead of
growing. Zero manifest-schema impact; rides releases untouched by
release-please (registry-shaped seed). Both agents run it in the render
path itself (zoneweaver: buildTemplateContext via `answers_from_version`);
no UI surface.

### Rendering contract

`templates/Hosts.template.yml` is TRUE Jinja2 (gonja in Go; nunjucks on
zoneweaver). Context, in precedence order: structured
`settings`/`networks`/`roles` + flattened UPPERCASE settings vars +
role-enable flags (both casings) + `<ROLE>_INSTALLER_*` file vars +
manifest field defaults + user answers by exact field name + `SECRETS_*`
globals. Undefined renders EMPTY STRING. `::TOKEN::` is dead SHI syntax.
Template includes are containment-locked to the package's `templates/`
directory. Both agents render at machine create, split infra vs provisioner
sections, and stamp `provisioner_name`/`provisioner_version` +
`provisioner_ref` into the stored document.

### Transports matrix (the WSL rows shipped — internal/ansiblehost)

| Host | Guest | scripts | ansible-local | ansible remote |
| --- | --- | --- | --- | --- |
| unix/mac | unix | ✔ | ✔ | ✔ |
| unix/mac | Windows | ✔ | ✘ | ✔ over winrm |
| Windows | unix | ✔ | ✔ | ✔ via WSL ansible |
| Windows | Windows | ✔ (ps1) | ✘ | ✔ via WSL ansible (+pywinrm in WSL) |

**vars → env for scripts:** exported under their EXACT names, no prefix;
lists/dicts as JSON strings.

### Sequence hooks

`provisioning.pre[]` / `provisioning.post[]`, entries `{script, target:
host|guest, on_failure: abort|continue, run: always|once}`. Host-target
gate: agent config `host_hooks` — hyperweaver-agent default ON,
zoneweaver-agent default OFF (shared hosts). Non-seeded packages whose
rendered documents carry host-target hooks require a ONE-TIME confirmation,
strictly a PRE-FLIGHT gate — the provision request is refused up front with
a needs-confirmation answer; a running sequence is never aborted by this
check; seeded packages never prompt. `pre_tasks`/`post_tasks` are
PLAYBOOK-LAYER keys: they ride the document VERBATIM but the platform gives
them NO dedicated surface — the sequence hooks are the platform-native
replacement.

### Role port_forwards

hyperweaver-agent (Go) ONLY. Zoneweaver does NOT support port forwards:
Hyperweaver-agent supports port forwarding, zoneweaver does NOT.

### Share + catalog (the HACS model)

Repo: `https://github.com/STARTcloud/provisioner-catalog`; agents fetch
`https://provisioner-catalog.startcloud.com/catalog.json` (format_version 1).

- **Admission by humans:** one-line PR into `sources.yml`; submitter runs
  the catalog's reusable validation action green in their own CI first; PR
  checks re-validate; a maintainer merges. No automation can ever admit a
  repo.
- **Data by schedule:** a job (cron + manual dispatch) regenerates
  catalog.json for admitted repos only from their GitHub releases
  (versioned assets + sha256 sidecars) and publishes only when data
  changed. Immutability tripwire: a published version whose asset hash
  changes FAILS the job loudly.
- **Authors own their releases** — no per-version PRs, no yank/deprecate
  machinery; a deleted release simply disappears. `removed.yml` =
  maintainer blacklist post-admission.
- **Second door:** fork the catalog repo as a template and run your own;
  agents accept multiple catalog sources.
- Artifact URLs are OPAQUE (release tags contain a slash — never
  parse/construct); sha256 verified before anything lands; published
  checksums never change.
- **Host-to-host share:** export a version as tar.gz + sha256 of the
  archive (whole-file only, no per-file manifests); multipart
  import-upload.

### Create-Provisioner (the Wave 7 spec)

- Sources: new-from-generic (star template) · fork existing (new
  version/family) · start from a machine's document. Pure copies; versions
  immutable; no shared mutable state between packages.
- Authored: manifest via the field-designer (emits ONLY the DSL; live
  preview IS the real machine-create form; Raw YAML tab two-way syncs, hand
  edits win) · template (generated; Jinja2 vars where fields are marked) ·
  collections (inherit / copy from another package / fetch via the import
  source resolver) · playbooks + scripts via inline browser editing.
- Copies stamp `forked_from` (removable). Driver (`core/` + Vagrantfile)
  included in built packages. role-specs + playbook candidates +
  schema.json derived on assemble.
