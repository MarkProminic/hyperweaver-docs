---
title: Capability Matrix
layout: default
nav_order: 7
permalink: /capability-matrix/
---

# Capability Matrix — token × agent × UI surface
{: .no_toc }

> **Cross-agent reference (roadmap item 17, 2026-07-12).** The single table mapping every
> capability token each host-agent advertises on `GET /status` to the Hyperweaver UI surface
> it gates. Authored from the two agents' enumerations + the UI's own gate-call-site audit;
> the per-agent detail lives in each agent's capability-model doc, and D14 in the
> architecture doc is the authoritative token registry.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## 1. How gating works

Every capability field on `/status` is an array of kebab-case tokens; **presence = supported**.
The UI reads them off `server.capabilities` (identical shape in Direct mode and behind the
Server's verbatim Aggregated passthrough).

- `hasFeature(server, token)` / `hasConsole(server, token)` return `features.includes(token)` /
  `console.includes(token)` — **unless the array is absent**, in which case they render-all
  (a legacy agent, or the capability poll hasn't landed).
- `hasHypervisor(server, name)` gates the **deliberate platform divergences ONLY** (§3) —
  never a stand-in for a feature token.
- An absent token is a deliberate signal: the panel hides rather than rendering a dead surface.

Legend: **✓** advertised · **cfg** config-gated (present only when its config block is enabled)
· **exp** experimental-gated · **—** not advertised.

---

## 2. Token → agent → UI surface

### 2.1 Console tokens (`console[]`) — the emergency-console viewer choice

| Token    | Go (virtualbox) | Zoneweaver (bhyve) | UI surface gated (`hasConsole`)                                                  |
| -------- | --------------- | ------------------ | -------------------------------------------------------------------------------- |
| `vnc`    | cfg (VBoxVNC)   | ✓                  | VNC console start/switch buttons + viewer; `machines/:m/vnc` auto-poll           |
| `rdp`    | ✓               | —                  | Browser VRDP/guest-RDP console + IronRDP viewer (Go only)                        |
| `zlogin` | —               | ✓                  | zlogin console start/switch buttons + PTY viewer (zoneweaver only)               |

### 2.2 Common feature tokens (`features[]`) — both agents

| Token                  | Go  | ZW      | UI surface gated (`hasFeature`)                                                        |
| ---------------------- | --- | ------- | -------------------------------------------------------------------------------------- |
| `machines`             | ✓   | ✓       | Machines page, sidebar tree expansion, dashboard machine counts                        |
| `machine-create`       | ✓   | ✓       | New/Clone affordances (page header, navbar, list panel, dashboard quick-action)        |
| `machine-modify`       | ✓   | ✓       | Settings tab + modify/accrue-changes pipeline                                           |
| `machine-snapshots`    | ✓   | ✓       | Snapshots tab, Take Snapshot, Clone, retention policy editor                            |
| `machine-suspend`      | ✓   | exp     | Suspend + Resume controls (navbar Controls, list-panel row)                            |
| `machine-screenshot`   | ✓   | ✓       | Live console screenshot (inactive-console default view)                                |
| `ssh`                  | ✓   | ✓       | In-guest SSH terminal console (start/switch buttons, `machines/:m/ssh/*`)               |
| `host-terminal`        | ✓   | ✓       | Footer host shell (`/term`)                                                             |
| `host-power`           | cfg | ✓       | Host restart / power-off / halt (navbar Host Actions)                                   |
| `tasks`                | ✓   | ✓       | Task queue panel (footer)                                                               |
| `monitoring`           | ✓   | cfg     | Host telemetry panels + machine monitoring health                                      |
| `processes`            | ✓   | ✓       | Processes tab (Manage)                                                                  |
| `swap`                 | ✓   | ✓       | Swap panel (host data)                                                                  |
| `provisioning`         | ✓   | ✓       | Provisioning tab/pipeline, provisioning network + profiles (Manage)                    |
| `provisioner-registry` | ✓   | ✓       | Provisioners tab (Manage) + the registry-driven create wizard                          |
| `templates`            | ✓   | cfg     | Templates tab (Manage) + wizard box catalog                                            |
| `artifacts`            | cfg | cfg     | Installer Files tab, artifact storage, cached-ISO pickers                              |
| `file-browser`         | cfg | cfg     | File Manager (Manage) + agent-host path pickers                                         |
| `guest-agent`          | cfg | cfg     | Guest-agent card, Edit-machine QEMU-GA checkbox, guest IP/facts                         |

### 2.3 Go-only feature tokens (deliberate — no zoneweaver analog)

| Token            | Go  | ZW  | UI surface gated                                                                       |
| ---------------- | --- | --- | -------------------------------------------------------------------------------------- |
| `secrets`        | ✓   | —   | Agent Settings → Secrets tab (global SHI secrets)                                       |
| `host-launchers` | ✓   | —   | Per-machine application launch menu + open-directory/FTP + Applications settings editor |

### 2.4 Zoneweaver-only feature tokens (deliberate — illumos/OmniOS surfaces)

| Token               | Go  | ZW  | UI surface gated (Manage-page sub-tab unless noted)                     |
| ------------------- | --- | --- | ----------------------------------------------------------------------- |
| `services`          | —   | ✓   | Services tab (SMF)                                                       |
| `zfs`               | —   | ✓   | Storage tab + storage-monitoring panels + host Storage context tab      |
| `vnics`             | —   | ✓   | Network tab + host Networking context tab                               |
| `boot-environments` | —   | ✓   | Boot Environments tab (beadm)                                           |
| `packages`          | —   | ✓   | Package Management tab (IPS)                                            |
| `repositories`      | —   | ✓   | Repositories (within Package Management)                                |
| `time-sync`         | —   | ✓   | Time tab (NTP/timezone)                                                 |
| `system-users`      | —   | ✓   | User & Groups tab (RBAC)                                                |
| `fault-management`  | —   | cfg | Fault Management tab (FMA)                                              |
| `devices`           | —   | cfg | Devices host context tab (PCI/PPT)                                      |
| `syslog`            | —   | cfg | Syslog view (within Fault Management)                                   |
| `log-streaming`     | —   | cfg | Live log tail (within Fault Management)                                 |

---

## 3. Hypervisor-derived gates (deliberate divergences, NOT tokens)

These ride `hasHypervisor` — Mark's ruled platform divergences where a token would be the wrong
axis. `hypervisors[]` is data (drives the Zone/Machine noun); it is never a feature gate except
for the rows below.

| UI surface                                              | Rule            | Reason                                                     |
| ------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| Pause control                                           | `!bhyve` (Go)   | No bhyve pause analog (Suspend/Resume ride the token)     |
| Install OS (unattended), Import (.ova/.ovf), Move       | `!bhyve` (Go)   | VirtualBox appliance/answer-file surfaces                 |
| Run in Guest (Guest Additions exec), Set Display Size   | `!bhyve` (Go)   | Guest Additions surfaces                                  |
| Secure Boot panel, USB passthrough tab                  | `!bhyve` (Go)   | EFI NVRAM + VBox USB device model                         |
| Filesystems tab, Boot Order / Boot Next (bhyve attrs)   | `bhyve` (ZW)    | zonecfg lofs mounts + bhyve bootorder attrs               |

The `nmi` (Inject NMI) control gates by **endpoint on both agents** — no token.

---

## 4. Platform-conditional fields (not gating — request shaping)

| Surface                    | Condition                | Behavior                                                          |
| -------------------------- | ------------------------ | ---------------------------------------------------------------- |
| File-manager uid/gid       | `platform === 'windows'` | omitted (a Windows agent 400s on uid/gid); mode = read-only attr |
| Archive-create formats     | Go platforms             | `zip`/`tar`/`tar.gz` only (Go bzip2 is decompress-only)          |

---

## 5. The Server row

The Hyperweaver Server's own `GET /api/status` advertises **no capability tokens** — only
`{role: server, version, auth[], datacenter_label?}`. Server-only surfaces (registry CRUD,
users/orgs/invitations, mail, settings/backup/SSL, favorites) gate on `role === 'server'`, not
tokens. The support/ticket link gates on `GET /api/config/ticket`. In Aggregated mode the Server
passes each agent's `capabilities` through **verbatim** — new agent tokens reach the UI with zero
Server changes.

---

## 6. Audit status

UI gate-call-site audit vs both enumerations (2026-07-12): **no dead gates** (every token maps to
at least one agent) and **no missing gates** — the ssh↔feature / zlogin↔console taxonomy move is
consumed at every call site, and previously-ungated console buttons are token-gated. See the
architecture doc's D14 token registry for the authoritative cross-agent state.
