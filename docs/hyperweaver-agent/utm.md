# SHI + UTM — Findings (UTM-Support branch)

> **Scope note:** These findings describe G:\Projects\Super.Human.Installer with the **`UTM-Support` branch checked out** (as of 2026-07-19, working tree tip `4733b88`). The earlier main-branch survey found zero UTM code; this replaces it. Local-disk evidence only; repo untouched.

## Executive summary (5 lines)
1. On UTM-Support, SHI handles UTM as a **thin detection + configuration layer**; the actual hypervisor driving is delegated to vagrant via the **`vagrant_utm` vagrant plugin**, which SHI auto-installs before `vagrant up` — confirming the working theory.
2. SHI's own code: a `UTM` app wrapper around `utmctl` (detect/list/start/stop, version via Info.plist), a runtime `USE_UTM` flag auto-set on ARM Macs when UTM.app exists, a macOS Settings toggle (`_cbUseUTM`), and a status-bar version display.
3. Provider selection is a **template variable, not a lifecycle branch**: the Hosts.yml generator writes `VAGRANT_PROVIDER = USE_UTM ? "utm" : "virtualbox"`, which lands as `provider_type:` in the server's Hosts.yml; vagrant + vagrant_utm consume it.
4. The VM lifecycle (up/halt/destroy/status) remains 100% provider-agnostic vagrant calls plus **VirtualBox-only** fallbacks (poweroff/unregister/status model) — UTM machines are listed but explicitly NOT integrated into CombinedVirtualMachine/ServerManager ("Phase 2" comment).
5. Delta vs main: everything above is branch-only — main has no UTM file, flag, plugin logic, or provider variable; main's only plugin flow is vagrant-scp-sync and its ARM gate hard-blocks server start.

## Findings table

| Mechanism | How it functions | Branch delta vs main | file:lines |
|---|---|---|---|
| UTM app detection wrapper (`utmctl`) | `UTM extends AbstractApp` with `_executable = "utmctl"` and path additions `/Applications/UTM.app/Contents/MacOS` + `/usr/local/bin`; `which utmctl` detection via the AbstractApp init flow. Singleton, mirrors the VirtualBox wrapper pattern. | Entirely new — main has no UTM class anywhere in `applications/`. | `Genesis\Source\prominic\sys\applications\utm\UTM.hx:47,83-95` |
| UTM VM list / start / stop | `getListVMs()` runs `utmctl list` and parses "Name (status)" lines into `UTMMachine {name, status}`; `startVM()` runs `utmctl start <name>`; `getPowerOffVM()` runs `utmctl stop <name> [--force]`. Nothing in Server.hx calls startVM/getPowerOffVM — only the list is used (system info). | Entirely new. | `UTM.hx:118-133` (list), `:135-158` (stop), `:160-179` (start), `:302-324` (parser); typedef `utm\UTMMachine.hx:3-16` |
| UTM version via Info.plist | `getVersion()` does not parse utmctl output; it reads `/Applications/UTM.app/Contents/Info.plist` via `PListUtil.readFromFile` and regex-extracts `CFBundleShortVersionString => x.y.z`. PListUtil parses plist XML (falls back to `plutil -convert xml1`). | Entirely new (UTM.hx and its use of PListUtil for UTM). PListUtil itself is generic Genesis code. | `UTM.hx:181-217` (esp. 192-214); `Genesis\Source\prominic\helpers\PListUtil.hx:10-44,221-226` |
| Runtime provider flag `USE_UTM` + UTM URLs | Mutable global `USE_UTM:Bool = false` plus `UTM_URL`/`UTM_DOWNLOAD_URL` ("https://mac.getutm.app/"). Single source of truth read by plugin check, hosts generator, ARM gate, settings toggle. | New — main's SuperHumanGlobals has neither the flag nor the URLs. | `Source\superhuman\config\SuperHumanGlobals.hx:90-94,105-106` |
| ARM auto-detection of UTM at startup | `_checkAppsInitialized` waits for Vagrant+VirtualBox+UTM init; if CPU is Arm64, sets `USE_UTM = UTM.getInstance().exists`. Prerequisite pass then runs UTM version+list executors alongside the VirtualBox ones when UTM exists. UTM's `getInit()` is added to the startup ParallelExecutor. | Main initializes only Vagrant/VirtualBox/Git and never touches UTM. | `Source\SuperHumanInstaller.hx:557-559` (init), `:565-576` (ARM → USE_UTM), `:580,591-596` (version/list executors), `:687-695` (init log) |
| vagrant_utm plugin check + auto-install | Before `vagrant up`, `_checkAndInstallVagrantPlugin` runs `vagrant plugin list`; `needsUTMPlugin = isARM && USE_UTM` (mac only); greps output for `vagrant_utm`; missing plugins are installed via `vagrant plugin install <name>` with chained callbacks (scp-sync first, then vagrant_utm), then `_executeVagrantUp()`. Install failure is non-fatal. | Main's flow is single-purpose vagrant-scp-sync (main Server.hx 1812-1916); branch parameterizes the installer (`_safeInstallVagrantPlugin(pluginName, callback)`) and adds the UTM condition and plugin name `vagrant_utm`. | `Source\superhuman\server\Server.hx:1952-2024` (check), `:2032-2111` (installer) |
| Provider selection as provisioner variable | Hosts.yml generator sets `VAGRANT_PROVIDER: USE_UTM ? "utm" : "virtualbox"` among the template values; the bundled Hosts.template.yml consumes it as `provider_type: ::VAGRANT_PROVIDER::` under "Provider Specific Settings". The provisioner's Vagrantfile machinery then picks the vagrant provider — SHI never passes `--provider` to vagrant (branch Vagrant.hx `getUp` at 469-487 has no provider arg). | The ternary is branch-only (USE_UTM doesn't exist on main). Template `provider_type` line delta vs main not directly compared, but it is inert without the generator variable. | `Source\superhuman\server\hostsFileGenerator\StandaloneProvisionerHostsFileGenerator.hx:390-392`; same injection for custom provisioners at `Source\superhuman\server\provisioners\CustomProvisioner.hx:804`; `Assets\provisioners\hcl_domino_standalone_provisioner\0.1.23\templates\Hosts.template.yml:31-32` |
| UI exposure: Settings toggle + download button | macOS-only "Virtualization" row: VirtualBox label — checkbox `_cbUseUTM` — UTM label; checkbox seeded from `USE_UTM`, and Save writes `USE_UTM = _cbUseUTM.selected` (runtime global only — NOT persisted to .shi-config; restart re-derives from ARM auto-detect). If UTM.app is absent, a "Download UTM" button opens UTM_DOWNLOAD_URL. | Whole section is branch-only: it references the branch-only UTM class and USE_UTM field. | `Source\superhuman\components\SettingsPage.hx:104-105,237-279` (UI), `:468-473` (save), `:517-525` (download) |
| ARM start-gate relaxed + install hint | `_startServer` blocks ARM only when `!USE_UTM`; the not-supported alert appends "Please install UTM from <UTM_DOWNLOAD_URL>" on ARM. | Main hard-blocks all ARM starts unconditionally (main SuperHumanInstaller.hx 1845-1851). | `Source\SuperHumanInstaller.hx:1705-1710` (gate), `:2309-2322` (alert) |
| Status-bar UTM version | On ARM Macs with UTM installed, footer sysInfo appends `\| UTM: <version>`. | New — main's footer lists Vagrant/VirtualBox/Git/Rsync only. | `Source\SuperHumanInstaller.hx:1773-1776` |
| NO UTM lifecycle integration (deliberate) | `_utmListVMsUpdated` only logs UTM machines: "We will need to enhance the ServerManager and CombinedVirtualMachine classes to support UTM machines in Phase 2". Status derivation still switches only on vagrantState/virtualBoxState; CombinedVirtualMachine still holds exactly `vagrantMachine` + `virtualBoxMachine`; force-stop/unregister/exists-checks still go straight to VBoxManage. | Same as main — the branch did NOT extend the status model; deltas are zero in ServerManager.hx, CombinedVirtualMachine.hx, ServerData.hx, ServerType.hx, SuperHumanConfig.hx re UTM. | `SuperHumanInstaller.hx:758-771`; `ServerManager.hx:158-253`; `CombinedVirtualMachine.hx:36-44`; `Server.hx:446-455,1613-1643,1907-1915` |
| Vagrant wrapper unchanged | Branch Vagrant.hx has zero UTM references; plain `vagrant up/halt/destroy/...`; only provider awareness is parsing `provider-name` from `vagrant global-status` into `VagrantMachine.provider`. | No UTM delta (branch file is an older base than main, but that predates UTM work and is unrelated). | `Genesis\...\hashicorp\Vagrant.hx:469-487` (getUp, no --provider), `:676-680` (provider parse), `:942-950` (typedef) |

## Chain, end to end
`SettingsPage._cbUseUTM` / ARM auto-detect (`SuperHumanInstaller.hx:565-576`) → `SuperHumanGlobals.USE_UTM` (:105-106) → on start: (a) `Server.hx:1952-2024` ensures `vagrant_utm` plugin, (b) `StandaloneProvisionerHostsFileGenerator.hx:390-392` writes `provider_type: utm` into Hosts.yml → provisioner Vagrantfile selects the utm vagrant provider → **vagrant_utm plugin talks to UTM**. SHI itself never drives UTM VMs (utmctl start/stop exist in UTM.hx but are unused by the Server lifecycle).

## Files a follow-up implementer must read
- G:\Projects\Super.Human.Installer\Genesis\Source\prominic\sys\applications\utm\UTM.hx
- G:\Projects\Super.Human.Installer\Genesis\Source\prominic\sys\applications\utm\UTMMachine.hx
- G:\Projects\Super.Human.Installer\Genesis\Source\prominic\helpers\PListUtil.hx
- G:\Projects\Super.Human.Installer\Source\superhuman\config\SuperHumanGlobals.hx (USE_UTM, UTM URLs)
- G:\Projects\Super.Human.Installer\Source\SuperHumanInstaller.hx (init wiring, ARM detect, gate, footer, Phase-2 TODO at 758-771)
- G:\Projects\Super.Human.Installer\Source\superhuman\server\Server.hx (plugin check/install 1952-2111; VirtualBox-only fallbacks that Phase 2 must branch)
- G:\Projects\Super.Human.Installer\Source\superhuman\components\SettingsPage.hx (toggle 237-279, save 468-473)
- G:\Projects\Super.Human.Installer\Source\superhuman\server\hostsFileGenerator\StandaloneProvisionerHostsFileGenerator.hx (VAGRANT_PROVIDER 390-392)
- G:\Projects\Super.Human.Installer\Assets\provisioners\hcl_domino_standalone_provisioner\0.1.23\templates\Hosts.template.yml (provider_type consumption, line 32)
- G:\Projects\Super.Human.Installer\Source\superhuman\managers\ServerManager.hx (status model that still ignores UTM)
- G:\Projects\Super.Human.Installer\Source\superhuman\server\CombinedVirtualMachine.hx (data shape lacking a utmMachine slot)

## Looked for, not found
- `--provider` argument in any vagrant invocation — absent (branch `Vagrant.hx:469-487` and every call site in `Server.hx`); provider flows only via Hosts.yml `provider_type`.
- UTM in the status model — `ServerManager.getRealStatus` (158-253) switches only on vagrant/VirtualBox states; no `utmMachine` field in `CombinedVirtualMachine.hx:36-44`; `_utmListVMsUpdated` explicitly defers integration to "Phase 2" (`SuperHumanInstaller.hx:758-771`).
- Any Server-lifecycle call to `UTM.startVM`/`UTM.getPowerOffVM` — none in `Server.hx` (full read); force-stop and unregister use VirtualBox only (`Server.hx:1613-1643,1907-1915`).
- Persistence of the UTM preference — `SettingsPage._saveButtonTriggered` writes only the runtime global (`SettingsPage.hx:468-473`); no UTM field in `SuperHumanConfig.hx:40-48` or `ServerData.hx:36-73`; per-server provider choice does not exist (global only).
- UTM validation in `Server.isValid()` — still requires Vagrant + VirtualBox even when USE_UTM (`Server.hx:720-721,742-753`); UTM does not substitute for VirtualBox in validity checks.
- UTM in `ServerType.hx` (33-38: default/domino only) and in branch `Vagrant.hx` (full read, zero matches).

---

# Part 2 — vagrant_utm plugin mechanics (G:\Projects\vagrant_utm, read first-hand 2026-07-19)

The plugin drives UTM through TWO channels: **utmctl** (lifecycle) and **UTM's AppleScript/JXA scripting API** (`tell application "UTM"` — configuration read/update). No GUI automation, no config-file hacking. MIT-licensed, but README:45 notes parts derive from vagrant's BSL virtualbox plugin — reuse MECHANICS, never code.

| Mechanism | How it functions | file:lines |
|---|---|---|
| Two-channel driver | utmctl (Which, fallback /Applications/UTM.app/Contents/MacOS/utmctl) for start/stop/suspend/delete/status/exec/ip-address; osascript for everything configuration | driver\base.rb:27-32, 261-345; version_4_5.rb:257-281 |
| UTM version + floor | `tell application "System Events" to return version of application "UTM"`; HARD FLOOR **UTM ≥ 4.6.5** (import + registry support); driver picked per version | driver\meta.rb:36-91, 130-142 |
| VM CREATE = import box.utm | The vagrant box carries a **box.utm bundle**; create = AppleScript `import new virtual machine from <file>` (4.6) or the `utm://downloadVM?url=` URL scheme (4.5); imported UUID captured from output (4.5 hack: last VM in list) | action\import.rb:16-46; scripts\import_vm.applescript; scripts\downloadVM.sh; driver\version_4_6.rb:35-51; version_4_5.rb:297-318 |
| Configuration API pattern | `virtual machine id X` → `configuration of vm` → set properties → `update configuration of vm with config` (VM must be STOPPED for qemu-arg updates) | scripts\customize_vm.applescript:26-57 |
| CPU/RAM/name/notes | config properties: `cpu cores`, `memory` (MB), `name`, `notes`, `directory share mode` (4-byte enums SmOf/SmWv/SmVs = none/webDAV/virtFS) | scripts\customize_vm.applescript; config.rb:64-110 |
| Port forwards | On the EMULATED interface only: `network interfaces of config` → `port forwards of anInterface` → append/remove `{protocol, guest address, guest port, host address, host port}`; protocol enums **TcPp/UdPp**; read emits VirtualBox-style `Forwarding(n)(i)=` lines | scripts\add_port_forwards.applescript; read_forwarded_ports.applescript; clear_port_forwards.applescript; version_4_5.rb:85-113, 146-174 |
| SSH transport | 127.0.0.1 + the host port whose guest port is 22 — EXACTLY VirtualBox's NAT ssh-forward model | provider.rb:80-103; version_4_5.rb:205-214 |
| Networks beyond the base | QEMU-arg passthrough: `-netdev vmnet-{shared\|bridged\|host},id=netN[,ifname=en0]` + `-device {virtio-net-pci\|e1000},mac=…,netdev=netN` appended to `qemu additional arguments of config`; base adapters net0/net1 preserved; MAC randomized locally (UTM can't) | version_4_5.rb:327-519; scripts\configure_network_adapter.applescript; base.rb:176-183 |
| QEMU args = directives analog | `qemu additional arguments of config` is the general passthrough — the plugin's own example adds **`-vnc 127.0.0.1:N`** (the console story) | scripts\add_qemu_additional_args.applescript:5 |
| Shared folders | virtFS 9p via qemu args `-fsdev local,id=…,path=…,security_model=mapped-xattr` + `-device virtio-9p-pci,fsdev=…,mount_tag=…` PLUS adding the folder to `registry of vm` (macOS sandbox file access) | scripts\add_folder_share.applescript; version_4_6.rb:59-105 |
| Guest agent first-class | qemu-guest-agent probed via `utmctl exec <id> --cmd whoami`; guest IPs via `utmctl ip-address <id>` — maps 1:1 onto our QGA surface | version_4_5.rb:31-39, 176-179 |
| State | `utmctl status <id>` → symbol (started/stopped/paused...); list via JXA `Application('UTM').virtualMachines()` → JSON {UUID, Name, Status} | version_4_5.rb:217-220, 283-291; scripts\list_vm.js |
| Snapshots (offline) | `qemu-img snapshot -c/-d/-a/-l` against the qcow2 at `~/Library/Containers/com.utmapp.UTM/Data/Documents/<name>.utm/Data/<uuid>.qcow2` — VM stopped only | version_4_5.rb:41-83, 115-138 |
| Export | `export vm to <POSIX file>` (4.6+) | scripts\export_vm.applescript; version_4_6.rb:53-57 |
| macOS only | Provider refuses non-darwin outright | provider.rb:24-27 |

## What the hyperweaver-agent (Go) UTM backend needs (the port map)
1. `internal/utm` mirroring `internal/vbox`: a utmctl runner + an osascript runner executing OUR OWN embedded AppleScript/JXA speaking the same API (config get/update, port forwards, qemu args, registry, import/export, list).
2. Template story: UTM boxes carry `box.utm` — the template registry stores the bundle; create = import → set name → cpu/memory → randomize MAC → ssh port-forward on the emulated NIC (our provisioning-NAT analog) → document networks as vmnet qemu args.
3. Transport unchanged: 127.0.0.1:<forward> — wait_ssh/sync/ansible pipeline works as-is; sync via our rsync/scp (no 9p needed).
4. `utm:` per-hypervisor document key (already reserved): qemu additional args = the `vbox.directives` analog; console = `-vnc` arg or UTM's own; guest-agent surface maps onto utmctl exec/ip-address.
5. Gates: darwin-only backend; UTM ≥ 4.6.5 pre-flight; config updates require the VM stopped (our accrue-changes contract fits perfectly).

## Plugin composition + topology facts (second read pass, 2026-07-19)
- **Adapter topology (the plugin's fixed base):** adapter 0 = `shared` (vmnet NAT, internet), adapter 1 = `emulated` VLAN — the ONLY type that supports port forwards, so SSH and every forward live on it; document networks land at adapter 2+ as qemu args (`compile_networks.rb:17` starts at index 2). Our create chain mirrors this exactly: 0/1 = our intrinsic transport pair, document networks ride 2+.
- **action_up chain** (`action.rb:432-458`): HandleBox → Customize pre-import → Import (box.utm) → MatchMACAddress → action_start → action_boot (SetName → ClearForwardedPorts → port-collision repair → synced folders → ConfigureNetworks (clear-additional-then-rebuild, "clean slate") → ForwardPorts → SetHostname → Customize pre-boot → Boot → WaitForCommunicator on states [starting, started]).
- **action_halt** (`action.rb:130-153`): paused VMs must RESUME before `utmctl stop` works; graceful then forced. Our stop ladder needs the same resume-first rung on UTM.
- **Snapshots**: stopped-only (qemu-img needs the write lock) — `action.rb:268-333` gates on IsStopped.
- **UTM has no `running` state** — states are starting/started/paused/stopped; the plugin waits on `started` (`action.rb:83-92`, provider.rb:81-84). Status map: started→running, stopped→stopped, paused→paused, starting→starting.
- **MAC**: UTM cannot generate one via scripting — the plugin randomizes locally (locally-administered bit) and sets NIC 0 (`base.rb:176-183`, match_mac_address.rb).
- **License note (Mark's ruling 2026-07-19 — near-moot, but know the map):** files with BUSL-1.1 SPDX headers / copied-from-vagrant code: `action/forward_ports.rb`, `action/customize.rb`, `action/match_mac_address.rb`, `util/compile_forwarded_ports.rb`, `driver/base.rb` execute(). Three reasons it barely matters: (1) vagrant was **MPL-2.0 until v2.4.0 (Aug 2023)** — the same logic exists at pre-BUSL tags (≤ 2.3.7) under MPL-2.0; fork/reference from there if reference is ever wanted; (2) Mark independently wrote vagrant-zones without reading vagrant source — the driver/action shape is convergent architecture, not derivation, and matching patterns are as attributable to his code; (3) our Go port implements observed BEHAVIOR against UTM's public API, not the Ruby text; (4) HashiCorp's own PUBLISHED plugin development guides (developer.hashicorp.com/vagrant/docs/plugins — the docs vagrant_utm's README itself credits) publicly teach the provider/driver/action architecture — a vendor-documented pattern is common knowledge, and everyone following the guides converges on the same shape. Default remains: write fresh Go from the mechanics.

---

# Part 3 — THE BUILD GUIDE: post-compaction reading list + work map

> **PURPOSE (Mark's order, 2026-07-19): after any compaction, the session working the UTM backend reads EVERY file below IN FULL (full-read rules: whole files, 500-line chunks, 250 dense) BEFORE any design or code. Then a verification round with Mark. The three lists: the SHI implementation, the vagrant_utm implementation, and our repo's seam files.**

## List A — SHI (G:\Projects\Super.Human.Installer, UTM-Support branch MUST be checked out)
1. Genesis\Source\prominic\sys\applications\utm\UTM.hx
2. Genesis\Source\prominic\sys\applications\utm\UTMMachine.hx
3. Genesis\Source\prominic\helpers\PListUtil.hx
4. Source\superhuman\config\SuperHumanGlobals.hx
5. Source\superhuman\components\SettingsPage.hx
6. Source\superhuman\server\Server.hx
7. Source\SuperHumanInstaller.hx
8. Source\superhuman\server\hostsFileGenerator\StandaloneProvisionerHostsFileGenerator.hx
9. Source\superhuman\server\provisioners\CustomProvisioner.hx
10. Assets\provisioners\hcl_domino_standalone_provisioner\0.1.23\templates\Hosts.template.yml (the provider_type consumption)

## List B — vagrant_utm (G:\Projects\vagrant_utm) — ALL of lib, no skips
- lib\vagrant_utm.rb · plugin.rb · provider.rb · config.rb · errors.rb · synced_folder.rb · version.rb
- driver\: base.rb · meta.rb · version_4_5.rb · version_4_6.rb
- action.rb PLUS every file in action\ (boot, boot_disposable, check_accessible, check_created, check_guest_additions, check_qemu_img, check_running, check_utm, clear_forwarded_ports, configure_networks, created, customize, destroy, export, forced_halt, forward_ports, import, ip_address, is_paused, is_running, is_stopped, match_mac_address, message_* (6), package, package_setup_files, package_setup_folders, package_vagrantfile, prepare_forwarded_port_collision_params, prepare_nfs_settings, prepare_nfs_valid_ids, resume, set_id, set_name, snapshot_delete, snapshot_restore, snapshot_save, suspend, wait_for_running)
- scripts\ — every file (add_folder_share, add_port_forwards, add_qemu_additional_args, clear_port_forwards, configure_network_adapter, customize_vm, downloadVM.sh, export_vm, import_vm, list_vm.js, open_with_utm.js, read_forwarded_ports, read_network_interfaces, read_qemu_network_adapters, read_shared_folders.js, read_shared_folders_args.js, remove_qemu_additional_args, set_mac_address)
- util\: compile_networks.rb · compile_forwarded_ports.rb · unix_mount_helpers.rb
- model\: forwarded_port.rb · list_result.rb
- commands\: disposable.rb · ip_address.rb
- README.md (license caveat) + docs site reference: https://naveenrajm7.github.io/vagrant_utm/

## List C — hyperweaver-agent (g:\Projects\hyperweaver-agent) — the seam files
1. internal\machines\model.go — Machine struct (NO hypervisor field today; Backing is provenance only), VBoxTarget, MapVBoxState
2. internal\machines\executors.go — resolve() hard-wires VBoxManagePath; every lifecycle executor calls vbox.* directly — THE dispatch seam
3. internal\machines\create_exec.go — the create-orchestration chain the UTM import-create mirrors
4. internal\machines\store.go + registry.go — row schema (hypervisor column lands here)
5. internal\machines\reconcile.go — discovery sweep (utmctl-list twin goes beside the VBox sweep)
6. internal\machines\templates.go + internal\server\templates_remote.go — box pull/provider filtering (utm-provider boxes, box.utm extraction)
7. internal\machines\hardware.go + knob_current.go + internal\server\machine_defaults.go — knob families (utm.* vocabulary joins vbox.*)
8. internal\machines\hostdoc.go — document readers (the utm: key consumption + winrm/credentials extraction)
9. internal\server\machines.go — liveMachineStatus (VBox-wired), findMachine, operation handlers
10. internal\server\status.go — hypervisors[]/console[]/features[] gating (utm advertises darwin ∧ UTM ≥ 4.6.5)
11. internal\server\machines_provision.go — resolveTransport/FindSSHForward (needs a UTM read-forwards twin)
12. internal\vbox\vbox.go + create.go + manage.go — the package pattern internal\utm mirrors
13. internal\qga\qga.go + internal\server\guest_agent.go — guest surface (second backend: utmctl exec/ip-address)
14. internal\prereqs\prereqs.go — tool detection (UTM row: utmctl path + System Events version)
15. internal\server\vnc.go + rdp.go — console story (UTM console = -vnc qemu arg → websockify; no VRDE/RDP)
16. internal\server\machines_create.go — the create HTTP handler (validation, typed disks, name derivation — the UTM create ENTERS here)
17. internal\machines\provisioned.go — the Spec struct (where a spec-level hypervisor marker could live)
18. internal\machines\disks.go — the typed disk spec (UTM's disk story differs: the qcow2 lives INSIDE the .utm bundle — boot type template maps to bundle import, not clonemedium)
19. internal\machines\modify_exec.go — the accrue-changes apply path (UTM config updates are stopped-only — this is where they land)

## The work map (what it takes, in build order)
1. **`utm:` document vocabulary** — design on the vbox pattern (utm.qemu_args = directives analog, utm.directory_share_mode, promoted first-class knobs); CROSS-AGENT SYNC FREEZE first (Hosts.rb + UI editor consume the same documents).
2. **Hypervisor seam** — machine.hypervisor field (virtualbox|utm) + dispatch: either a driver interface over the executor verbs or per-op branches; touches resolve(), liveMachineStatus, discovery, transport resolution.
3. **`internal/utm`** — utmctl runner + osascript runner + our own embedded scripts (fresh-written; see BUSL list); verbs: list/status/start/stop/suspend/delete/exec/ip-address + config get/update, forwards CRUD, qemu-args CRUD, registry add, import/export, version.
4. **Create chain** — import box.utm → set name → cpu/memory → randomize MAC (NIC 0) → ensure adapter 0 shared + adapter 1 emulated → ssh forward (guest 22) on adapter 1 → document networks as vmnet qemu args on 2+ → finalize row.
5. **Lifecycle** — start/stop (resume-first when paused; guest-agent → utmctl stop → --force ladder)/suspend/delete; status map started→running etc.
6. **Snapshots** — qemu-img offline against the bundle qcow2; stopped-gate like the plugin.
7. **Guest surface** — utmctl exec/ip-address backend behind the existing /guest endpoints.
8. **Gating/spec** — prereqs UTM row, /api/status utm advertising, knob_values/defaults utm family, openapi.
9. **EXTERNAL GATE:** STARTcloud images as .utm-carrying boxes in BoxVault (BoxPress/packer work — without them, lifecycle works but end-to-end provisioning has no box).

Reuse estimate (verified against both codebases): ~70% untouched (whole provisioning pipeline + document model + queue + server plumbing), ~20% extension (the seam + gating + knobs + templates), ~10% new (internal/utm + create chain).

## The EXISTING `utm:` document vocabulary (Hosts.rb:334-390, read 2026-07-19 — the freeze FLOOR: plain-vagrant users consume these today, so they are FROZEN semantics)
- `utm.notes` — VM notes string (default "Vagrant: For testing plugin development")
- `utm.check_guest_additions` — boolean (qemu-ga probe toggle)
- `utm.functional_9pfs` — boolean (whether the utm synced-folder type is valid)
- `utm.customizations[]` — `[{event: pre-import|pre-boot|post-boot|post-comm, command: [osascript-args…]}]` — the AppleScript passthrough ALREADY EXISTS as document vocabulary (the vbox.directives analog, event-scheduled)
- Generic keys the utm path consumes from `settings:` — vcpus, memory (gb/mb suffix parse), setup_wait, server_id+hostname naming (`<id>--<hostname>.<domain>` — same as vbox/zones); `folders[].type` picks directory share mode (utm→webDAV, virtualbox→virtFS, none otherwise); `roles[].port_forwards` → forwarded ports.

## Draft `utm:` EXTENSIONS to propose in the sync freeze (next session's first act — additions, never moves)
- `utm.qemu_args[]` — flat first-class QEMU-arg passthrough (cleaner than routing one-off args through customizations; UTM applies via `qemu additional arguments`)
- `utm.directory_share_mode` — explicit override (none|webDAV|virtFS) over the folder-derived default
- Promoted knobs as needed on the vbox.<section>.<key> pattern once real usage demands (start minimal — customizations[] + qemu_args[] cover the exotica)

## NEXT SESSION KICKOFF ORDER
1. Read this guide whole, then Lists A/B/C in full (full-read rules).
2. Post the `utm:` vocabulary (floor + extensions above) to the sync for the cross-agent freeze (zoneweaver hauls it inert; UI editor + Hosts.rb compatibility stated).
3. Verification round with Mark on the work map before any code.
4. Build order: seam (hypervisor field + dispatch) → internal/utm → create chain → lifecycle → the rest per the work map.
