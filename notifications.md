# Notifications from the STARTcloud UI estate

Estate-wide tracking is `../authorization-server-private/priorities.yaml`,
read-only from this repo; contracts are
`../startcloud-ui/docs/guides/universal-*.md`,
`../startcloud-ui/docs/guides/preferences-and-branding.md` and
`../startcloud-ui/docs/guides/UI-GROWTH-GUIDE.md`, the copies under
`../authorization-server-private/docs/guides/` being pointer stubs that
are never cited; the governing rules and the D-ledger for the hyperweaver
family are `docs/roadmap.md` in this repo.

## hyperweaver-server pages

Every claim below is `<file>:<line>` → required change → the deciding
source in `../hyperweaver-server/` unless another repo is named. Code is
the source of truth; read every file named in full before acting.

### Files to remove

Why: a committed copy of a generated file and a dated report both keep
saying what the code no longer does, and every reader trusts them.

- `changelogs/hyperweaver-server.md`, `changelogs/zoneweaver-agent.md` →
  remove from the tree; `README.md:16-18` says the build pulls them
  through `scripts/generate-docs.js`, so the committed copies drift, carry
  commit noise and old repository names → `.github/workflows/build-docs.yml:52-53`,
  `.github/workflows/ci.yml:57-58`, `scripts/generate-docs.js:19,23`.
- `archive/hyperweaver-scout-zoneweaver-agent.md`,
  `archive/hyperweaver-scout-shi.md`,
  `archive/hyperweaver-provisioning-design.md` → remove; dated scout and
  design reports superseded by the roadmap, carrying attributions the
  roadmap's own rules forbid → `../authorization-server-private/priorities.yaml:30-122`.
- Reference to update: `_config.yml:81` excludes `changelogs/` from
  publishing; the `{% include %}` in `docs/changelog.md:23` and
  `docs/zoneweaver-agent/changelog.md:17` resolves from the build-time
  output, so the generation step stays and the committed copies go;
  `scripts/generate-docs.js:19,23` write the two paths; `README.md:16-18`
  describes the pull. No file references `archive/`.

### docs/configuration.md

Why: an administrator who copies this page writes keys nothing loads and
the server starts with defaults or refuses to start.

- `configuration.md:35-38,111-115` document `app:` → no loader reads it;
  the keys are `frontend.name`, `frontend.version`, `frontend.frontend_url`
  → `packaging/config/production-config.yaml:38-59`, `auth/oidcLogout.js:39`.
- `configuration.md:40-42,122-126` document `server.port`, `server.host`,
  `server.trust_proxy` → the listen port is `frontend.port`, the proxy
  depth `frontend.trust_proxy`, `server.hostname` feeds only the redirect
  → `index.js:106,114,365`.
- `configuration.md:44-48,133-140` document `ssl:` with `key_path`,
  `cert_path`, `ca_path`, `force_ssl`, `protocols` → `server.ssl_enabled`,
  `ssl_generate`, `ssl_key_path`, `ssl_cert_path`, `ssl_ca_path`,
  `force_secure`; no protocols key; the files are `key.pem` and `cert.pem`
  → `index.js:332-361`, `utils/sslSetup.js:11-16`,
  `packaging/config/production-config.yaml:161-200`.
- `configuration.md:50-57,147-155` document `mail.smtp_auth_user`,
  `smtp_auth_pass`, `from_email`, `from_name` → `smtp_user`,
  `smtp_password`, `smtp_from` → `controllers/mail/transport.js:56-72`.
- `configuration.md:59-63,162-169` document `security.jwt_secret`,
  `jwt_expiry`, `session_timeout`, `bcrypt_rounds`, `password_min_length`,
  `require_email_verification` → `authentication.jwt_secret`,
  `jwt_expiration`, `local_session_timeout`, `local_bcrypt_rounds`,
  `local_password_min_length`, `local_require_email_verification` →
  `index.js:84`, `auth/passport.js:29`, `controllers/OidcController.js:265`,
  `packaging/config/production-config.yaml:605-727`.
- `configuration.md:65-68,176-184` show `database.*` as flat scalars →
  the keys are right; every leaf is a `{ type, value, … }` node today →
  `models/index.js:20-34`, `packaging/config/production-config.yaml:998-1153`.
- `configuration.md:70-74,191-198` document `frontend.theme`, `logo_url`,
  `favicon_url`, `company_name`, `footer_text` → the keys are `name`,
  `version`, `frontend_url`, `port`, `auto_refresh_interval`,
  `enable_notifications`, `enable_dark_mode`, `trust_proxy` →
  `packaging/config/production-config.yaml:38-100`.
- `configuration.md:76-78,205-210` document a top-level `cors:` →
  `security.cors.whitelist`, `allow_origin`, `preflight_continue`,
  `credentials` → `index.js:108-112`,
  `packaging/config/production-config.yaml:202-234`.
- `configuration.md:80-83,217-222` document `backend_servers:` → no such
  block; the agent poll is `agents.poll_interval`, `agents.poll_timeout`,
  the client timeouts `limits.api_timeouts.*` →
  `utils/agentHealthPoller.js:13-20`, `models/serverRequests.js:56-65`,
  `packaging/config/production-config.yaml:386-408,1155-1175`.
- `configuration.md:85,229-231` document `environment:` and `debug:` →
  no reader; remove → `utils/config.js:8-32`.
- `configuration.md:87-91,238-245` document `logging.file`, `max_size`,
  `console`, `date_pattern` → `logging.level`, `console_enabled`,
  `log_directory`, `file_rotation.max_size`, `file_rotation.max_files`,
  `performance_threshold_ms`, `categories.*` →
  `utils/loggerCore.js:18-28,40,137-138,157`.
- `configuration.md:93-96,252-258` document `limits.max_organizations`,
  `max_users_per_org`, `max_backend_servers`, `rate_limit_requests` →
  `limits.max_servers_per_user`, `api_timeouts`, `file_uploads`, and the
  `authentication`, `admin`, `apiProxy`, `standard`, `staticFiles` rate
  blocks → `routes/limiters.js:12-71`,
  `packaging/config/production-config.yaml:373-582`.
- `configuration.md:98-101,265-270` document `gravatar.enabled`,
  `default_avatar`, `rating`, `size` → `integrations.gravatar.api_key`
  only → `routes/gravatar.js:87-88`,
  `packaging/config/production-config.yaml:1188-1195`.
- `configuration.md:28` places the dev config at `config/config.yaml` →
  `./config.yaml` → `utils/config.js:15`.
- `configuration.md:272-292` describe `HYPERWEAVER_SERVER_*` environment
  overrides → remove; no such variable is read; the loader reads
  `CONFIG_PATH`, `index.js` reads `PORT`, both slated for removal in
  favour of `CONFIG_DIR` alone, and the `NODE_ENV` switch goes with them
  → `utils/config.js:8-32`, `index.js:106`,
  `../hyperweaver-server/notifications.md` section 5,
  `../startcloud-ui/docs/guides/universal-config.md:57-60,70`.
- `configuration.md:336-344` list startup warnings for SSL, SMTP, JWT,
  the database directory and unreachable agents → the only check is the
  `jwt_secret` fail-fast; a missing certificate falls back to HTTP →
  `index.js:84-91,390-399`.
- `configuration.md:356` restarts with `svcadm` → the service is systemd;
  `systemctl restart hyperweaver-server` →
  `packaging/DEBIAN/systemd/hyperweaver-server.service`,
  `packaging/DEBIAN/README.md:169`.
- Missing sections to add from the shipped file: `authentication.*`
  (local, LDAP, `oidc_providers`, external provisioning), `agents`,
  `integrations.boxvault`, `ticket_system`, `branding`, the rate-limit
  blocks → `packaging/config/production-config.yaml:1-1250`. Rewrite the
  page key by key from that file; once the server ships a schema
  (`../hyperweaver-server/notifications.md` section 7) generate it from
  the schema.

### docs/index.md

Why: the landing page hides half of what the package supports.

- `index.md:13,52` name the Zoneweaver Agent as the only host agent →
  both agents, the Hyperweaver Agent for VirtualBox included →
  `.github/workflows/prod-build.yml:96-97`, `controllers/ServerController.js:2-4`.

### docs/releases.md

Why: the download button answers 404.

- `releases.md:26` links `releases/latest/download/hyperweaver-server.deb`
  → the asset is `hyperweaver-server_<version>_amd64.deb` and no
  unversioned name is uploaded; link the releases page or the versioned
  name → `.github/workflows/prod-build.yml:109,125`.

### docs/api/index.md

Why: integrators send tokens to public routes, dial HTTP on a port that
redirects, look for a reset flow that does not exist and are surprised by
429s the page says cannot happen.

- `api/index.md:26` says every endpoint requires a JWT → public routes are
  `register`, `login`, `ldap`, `oidc/*`, `verify`, `setup-status`,
  `methods`, `status`, `health`, `config/ticket`, `invitations/validate`,
  `organizations/check` →
  `routes/index.js:41-44,61-62,77-79,196-199,250-254,472-485`.
- `api/index.md:39` offers HTTP on port 3443 → with SSL on, HTTP is port
  80 as a 308 redirect or dual-serve; HTTP on 3443 only when
  `server.ssl_enabled` is false or the certificate is missing →
  `index.js:361-389,397,405`.
- `api/index.md:59` lists password reset and recovery → only
  `change-password` exists → `routes/index.js:65-70`.
- `api/index.md:93` says the API has no rate limiting → every route and
  the static fallback carry a limiter → `routes/limiters.js:12-71`,
  `index.js:93-103,326`.

### docs/api/reference.md

Why: recorded as verified so nobody re-checks it.

- `api/reference.md:24` links the zoneweaver-agent `openapi.json` release
  asset → correct as written →
  `../zoneweaver-agent/.github/workflows/release-please.yml:45-71`.

### docs/capability-matrix.md

Why: the page names its governing documents and they cannot be opened, so
its authority cannot be checked.

- `capability-matrix.md:14-15,146` and
  `zoneweaver-agent/capability-model.md:22-23,42` cite
  `hyperweaver-architecture.md` and `hyperweaver-item2-contract.md` →
  neither file exists in this repo, `../hyperweaver-server`,
  `../hyperweaver-ui`, `../hyperweaver-agent` or `../zoneweaver-agent`;
  land those documents here or replace the citations with the contract
  files above.
- `capability-matrix.md:132-137` describe the Server's `/api/status` and
  the verbatim capability passthrough → correct as written →
  `controllers/StatusController.js:75-86`, `models/serverRequests.js:145`,
  `utils/orgVisibility.js:66-71`.

### docs/guides/backend-integration.md

Why: an operator pastes a key with the wrong prefix, dials the wrong port
on a VirtualBox host, and hunts for status colours and a settings page
that do not exist.

- `backend-integration.md:62,68` show the `wh_` prefix → `hw_`, format
  `hw_<key_id>.<secret>`; the Server never parses the prefix →
  `../hyperweaver-agent/internal/config/defaults.go:102-103`,
  `../zoneweaver-agent/middleware/VerifyApiKey.js:17-20`,
  `models/server.model.js:190-213`.
- `backend-integration.md:46` says agents listen on 5000 and 5001 → the
  Zoneweaver Agent does; the Hyperweaver Agent defaults to 9420 and 9421
  → `../zoneweaver-agent/packaging/config/production-config.yaml:2-4`,
  `../hyperweaver-agent/internal/config/defaults.go:20-23`.
- `backend-integration.md:26` names the Zoneweaver Agent only → both
  agents → `controllers/ServerController.js:2-4`.
- `backend-integration.md:76` promises green, yellow and red reachability
  → the Servers table has no status column; the tree shows a red
  unreachable row on a failed `/stats` and green or grey machine dots →
  `../hyperweaver-ui/src/components/Host/ServerTable.jsx:44-149`,
  `../hyperweaver-ui/src/components/SidebarTree.jsx:65-67,220-225`.
- `backend-integration.md:81` places org assignment under Settings →
  Organizations → it lives in Settings → Servers behind the
  building-user button; the Organizations page is a read-only super-admin
  list →
  `../hyperweaver-ui/src/components/HyperweaverSettings/ServerManagementTab.jsx:336,343-355`,
  `../hyperweaver-ui/src/components/Host/ServerTable.jsx:126-134`,
  `../hyperweaver-ui/src/components/Host/OrgAssignmentModal.jsx:22-107`,
  `../hyperweaver-ui/src/components/Organizations.jsx:22-37,140`,
  `routes/index.js:285-312`.

### docs/guides/installation.md

Why: a firewall built from the page blocks the HTTP redirect listener the
server always opens with SSL on.

- `installation.md:103-107` open port 3443 only → port 80 is bound
  whenever `server.ssl_enabled` is true; name both →
  `index.js:374,383`.

### docs/guides/authentication.md

Why: changing the documented key does nothing for local sessions.

- `authentication.md:36` says the JWT expiry is
  `authentication.jwt_expiration`, default 24h → local login hardcodes
  `24h` and only the OIDC path reads the key; say so, or change with the
  server when both paths read it → `controllers/auth/session.js:107-117`,
  `controllers/OidcController.js:265`.

### archive/*

Why: the folder ships in the site and describes routes and documents that
no longer exist; the removal above is the fix, this is what stands until
then.

- `archive/hyperweaver-scout-zoneweaver-agent.md:98` says the agent
  answers `/zones/*` beside `/machines/*` → only `/machines/*` exists →
  `../zoneweaver-agent/routes/MachineRoutes.js:106-256`.
- `archive/hyperweaver-provisioning-design.md:42` cites the architecture
  document above → the file does not exist.
- Mark every archive file as superseded at its top, or exclude the folder
  from the build → `_config.yml:24-81`.

### changelogs/*

Why: two sources of the same text diverge on every release; the removal
above is the fix.

- `changelogs/hyperweaver-server.md` and `changelogs/zoneweaver-agent.md`
  are generated at build and committed → one of the two; a generated file
  is not committed → `.github/workflows/build-docs.yml:52-53`,
  `_config.yml:79-81`, `scripts/generate-docs.js`.

### .github/workflows/ISSUE_TEMPLATE/*

Why: every issue filed against the docs site arrives shaped for an agent
bug and asks for a key in the wrong format.

- `bug_report.md:60` and `question.md:60` show `Bearer wh_...`, ports
  5000 and 5001, and describe the agent, not this docs site → `hw_`, and
  templates fitted to this repository's class →
  `../authorization-server-private/priorities.yaml:287-289`.

## zoneweaver-agent pages

Why: these pages are what an operator, an integrator and the UI's
authors read first, and today they route to paths that answer nothing,
name a service `svcadm` cannot find, and teach a key format the agent
refuses.

Every claim below is `docs/zoneweaver-agent/<file>:<line>` → required
change → the deciding source in `../zoneweaver-agent/`.

### zoneweaver-agent/api.md

Why: the overview advertises a removed surface and a route spelling the
agent refuses.

- `api.md:90` lists Provisioning profiles → drop the bullet; profiles
  were removed → `routes/CoreRoutes.js:130-131`, `config/DatabaseMigrations.js:15`.
  Why: a reader looks for endpoints that answer 404.
- `api.md:152` names `/zones/{zoneName}/vnc/websockify` → write
  `/machines/{machineName}/vnc/websockify` → `lib/WebSocketHandler.js:483`.
  Why: the upgrade matcher accepts the machines spelling only, so a
  noVNC client built from the page never connects.

### zoneweaver-agent/capability-model.md

Why: the UI gates panels on the tokens this page lists, and the list is
short by seven tokens and wrong on suspend and ticket scope.

- `capability-model.md:53` cites `routes/index.js` for `/status` and
  `/api/status` → cite `routes/CoreRoutes.js:196-197`.
  Why: a reader opening the cited file finds no route there.
- `capability-model.md:70` shows `console: ["vnc"]` → `["vnc", "zlogin"]`
  → `controllers/StatusController.js:231`.
  Why: a UI gating the zlogin console on this list hides a console the
  agent advertises.
- `capability-model.md:71-104,240` list a 21-token feature set → add
  `machine-snapshots`, `secrets`, `hosts-file`, `hostname`, `dns`,
  `ip-addresses` (platform) and `machine-suspend` (gated on
  `experimental.enabled`) → `controllers/StatusController.js:38-118`.
  Why: a UI author working from the page never gates the seven panels
  the agent already unlocks.
- `capability-model.md:160,202-203` say `machine-suspend` is never
  emitted and bhyve has no suspend → suspend and resume exist and the
  token rides `experimental.enabled` → `routes/MachineRoutes.js:176-177`,
  `controllers/StatusController.js:117`.
  Why: the page denies a surface the agent serves, so nobody wires the
  Suspend action for bhyve.
- `capability-model.md:174` says the `provisioning` token covers
  profiles → recipes and the pipeline only → `routes/CoreRoutes.js:84-131`.
  Why: a panel built for profiles has no endpoints behind it.
- `capability-model.md:296-299` say the WebSocket ticket is unbound →
  the ticket carries a machine scope and a mismatch answers 401 →
  `lib/WebSocketHandler.js:252-258,312,367,408,486,524`.
  Why: a client reusing one ticket across machines gets 401 and the page
  says that cannot happen.

### zoneweaver-agent/configuration.md

Why: every block below names keys the loader never reads, so a config
written from the page silently runs on defaults.

Rewrite the reference from the shipped file and the loader; every block
below is wrong today.

- `configuration.md:24-33` is a stray box diagram above the first
  heading → remove.
  Why: the page opens with an unlabelled ASCII drawing of an internal
  proxy layer that describes nothing on the page.
- `configuration.md:61,149,159-160,416` name `database.storage` and say
  only `sqlite` is supported → `database.directory` holding
  `core.sqlite`, `metrics-network.sqlite`, `metrics-storage.sqlite`,
  `metrics-system.sqlite`, plus `sqlite_options`; dialects `sqlite`,
  `postgres`, `mysql`, `mariadb` → `config/Database.js:22-27,85-154`,
  `packaging/config/production-config.yaml:18-40`.
  Why: `database.storage` is never read, so the databases land in the
  default directory and a network database is never offered.
- `configuration.md:67,172,180` give `key_length: 32` → 64 →
  `packaging/config/production-config.yaml:45`.
  Why: the documented default is half the shipped one.
- `configuration.md:74-75,202-203` name `zones.default_brand` and
  `zones.monitoring_interval` → the keys are `discovery_interval`,
  `auto_discovery`, `max_concurrent_tasks`, `task_timeout`,
  `task_poll_interval`, `resume_pending_tasks_on_start`,
  `orphan_retention`, `default_pagination_limit`, `server_id_start`,
  `prefix_zone_names`, `prefix_datasets`, `orchestration`,
  `resource_validation` → `packaging/config/production-config.yaml:49-93`.
  Why: neither documented key exists, and the eleven that do are
  undocumented.
- `configuration.md:77-80,218-223` give `vnc.port_range_start/end`,
  `web_path: /zones/{zoneName}/vnc`, `timeout` → `web_port_range_start`,
  `web_port_range_end`, `session_timeout`, `cleanup_interval`,
  `bind_address`, `max_concurrent_sessions`; no `web_path` →
  `packaging/config/production-config.yaml:148-154`, `config/ConfigLoader.js:194-199`.
  Why: a port range set under the documented names is ignored and the
  `/zones` web path never existed.
- `configuration.md:84-87,239-242` give `host_monitoring.network_scan_interval`
  and siblings → the `intervals`, `retention`, `error_handling` and
  `performance` subsections → `packaging/config/production-config.yaml:155-183`.
  Why: flat keys under `host_monitoring` are not read; the collectors
  keep their defaults.
- `configuration.md:100,107` document `server.bind_address` → no such
  key; the listener binds every address → `index.js:202`.
  Why: an admin who sets it to `127.0.0.1` believes the API is
  localhost-only while it listens on every interface.
- `configuration.md:117,124` document `ssl.ca_path` → no such key; the
  loader reads `enabled`, `force_secure`, `generate_ssl`, `key_path`,
  `cert_path` → `lib/SSLManager.js:20-25,104-107`,
  `packaging/config/production-config.yaml:5-10`.
  Why: a CA chain named there is never sent and clients see an
  incomplete chain.
- `configuration.md:259,286,335-342` document `provisioning.install_tools`
  → no such key → `packaging/config/production-config.yaml:109-145`.
  Why: the page promises automatic rsync, ansible and dhcpd installs
  that no code performs.
- `configuration.md:269-270,302-303` give `estub_provision` and
  `provision_interconnect0` → `zwestub_0` and `provisioning_0` →
  `packaging/config/production-config.yaml:128-129`.
  Why: `dladm` commands from the page target links the agent never
  creates.
- `configuration.md:368-385` describe `ZONEWEAVER_*` environment
  overrides → remove; no such variable is read; the config contract
  admits `CONFIG_DIR` alone → `config/ConfigLoader.js:31`,
  `../startcloud-ui/docs/guides/universal-config.md:57-60,70`.
  Why: an export set from the page changes nothing, and the contract
  forbids the mechanism.
- `configuration.md:404` says `http_port: 0` disables HTTP → the HTTP
  listener always starts; with `ssl.force_secure` it serves 308
  redirects only → `index.js:151-158,202`.
  Why: the process tries to bind port 0 and the operator believes HTTP
  is off.
- Missing sections to add from the shipped file: `ssl.force_secure`,
  `cors.allow_all`, `api_keys.bootstrap_require_claim_token`,
  `guest_agent`, `snapshots`, `provisioning.provisioners_path`,
  `provisioning.catalog_sources`, `provisioning.task_output`, `cleanup`,
  `logging`, `reconciliation`, `api_docs`, `ui`, `docs`,
  `ticket_system`, `experimental`, `packages`, `system_host`,
  `fault_management`, `system_logs`, `file_browser`, `artifact_storage`,
  `template_sources`, `updates` → `packaging/config/production-config.yaml:1-343`,
  `controllers/SettingsController/utils/schema/PlatformSchema.js`.
  Why: two thirds of the shipped file, including every kill-switch the
  capability tokens depend on, has no reference at all.

### zoneweaver-agent/releases.md

Why: the download link answers 404.

- `releases.md:27` links `zoneweaver-agent.p5p` → the release asset is
  `zoneweaver-agent-<version>.p5p` → `packaging/omnios/build.sh:227`,
  `.github/workflows/build-packages.yml:71-75`.
  Why: no unversioned asset is ever uploaded.

### zoneweaver-agent/guides/getting-started.md

Why: a first install following the page fails at the Node version, the
build script, the bootstrap body and the service user.

- `getting-started.md:29` says Node.js 18+ → 22 →
  `packaging/omnios/zoneweaver-agent.p5m:20`, `.github/workflows/ci.yml:29`.
  Why: an 18 host fails `npm ci` on the native modules.
- `getting-started.md:41` gives publisher `Makr91` at
  `https://packages.startcloud.com/omnios` → the prefix is `Makr91`; the
  public URL is not in the repository and must be confirmed against the
  package host, whose repository path is `/local/public/r151054/pkg`
  behind `pkg/server:r151054_STARTcloud` → `packaging/omnios/build.sh:221`,
  `.github/workflows/build-packages.yml:80-84`.
  Why: two guides give two publishers at two URLs, and `pkg` refuses a
  package whose publisher does not match the one it was built under.
- `getting-started.md:58` runs `npm run build` → no such script; drop it
  → `package.json:8-19`.
  Why: `npm` exits with a missing-script error mid-guide.
- `getting-started.md:74` gives `database.storage` → `database.directory`
  → `config/Database.js:87`.
  Why: the key is ignored and the databases land in the default path.
- `getting-started.md:119-125` bootstrap with `name` and `description`
  only → the body must carry `setupToken` read from `setup.token` beside
  the config file or the startup log → `controllers/ApiKeys.js:72-78`,
  `lib/SetupToken.js`, `packaging/config/production-config.yaml:44`.
  Why: the documented request answers 403 on every default install.
- `getting-started.md:153` tails `error.log` → `errors.log` →
  `lib/Logger.js:135,246`.
  Why: `tail` fails on a file that is never written.
- `getting-started.md:161` runs `chown -R zoneweaver:zoneweaver` →
  `zwagent:zwagent` → `packaging/omnios/startup.sh:27`.
  Why: the user does not exist and the command fails.

### zoneweaver-agent/guides/production-installation.md

Why: the SMF names, routes, database layout and bootstrap body on the page
all fail against the shipped package.

- `production-installation.md:38-41` list gcc-14 and gnu-make as
  installed dependencies → the package depends on `ooce/runtime/node-22`
  and `database/sqlite-3` only → `packaging/omnios/zoneweaver-agent.p5m:20-21`.
  Why: the page promises a compiler toolchain the package never pulls.
- `production-installation.md:54` gives publisher `startcloud` at
  `https://public.omnios.packages.startcloud.com` → the prefix is
  `Makr91`; align with getting-started once the public URL is confirmed →
  `packaging/omnios/build.sh:221`, `.github/workflows/build-packages.yml:80-84`.
  Why: `pkg install` refuses a package published under a different
  prefix than the one set on the client.
- `production-installation.md:73,79-89,138,198-213,219,226,311,317,335,344,368`
  name `application/zoneweaver-agent` and
  `application-zoneweaver-agent:default.log` →
  `system/virtualization/zoneweaver-agent` and
  `system-virtualization-zoneweaver-agent:default.log` →
  `packaging/omnios/zoneweaver-agent-smf.xml:7`, `packaging/omnios/zoneweaver-agent.p5m:12`.
  Why: every `svcadm` and `svcs` command on the page fails with an
  unknown FMRI and the log path does not exist.
- `production-installation.md:111,286-290` give `database.storage` and
  one `database.sqlite` file → `database.directory` and the four files →
  `config/Database.js:22-27,87`.
  Why: the backup cron line copies a file that is never written and
  skips the four that are.
- `production-installation.md:152-165` bootstrap without `setupToken`
  and a response with `created_at` → the token is required and the
  response is `api_key`, `message`, `note` → `controllers/ApiKeys.js:72-102`.
  Why: the documented request answers 403 and the shown response never
  appears.
- `production-installation.md:176,180` call `/api/entities` → the routes
  are `/api-keys` and `/api-keys/info` → `routes/CoreRoutes.js:209-213`.
  Why: the verification step answers 404 and the operator believes the
  install is broken.
- `production-installation.md:295-300` say the package ships logadm
  rotation → nothing is packaged; the application rotates its own files
  into `archive/` → `packaging/omnios/build.sh:90-168`, `lib/Logger.js:45-122`.
  Why: `grep zoneweaver-agent /etc/logadm.conf` returns nothing and the
  real archive directory is undocumented.
- `production-installation.md:351` validates the config with `node -c`
  → `node -c` parses JavaScript, not YAML; remove until the schema
  validation of the config contract exists → `config/ConfigLoader.js:39-54`.
  Why: the command reports a syntax error on every valid YAML file.

### zoneweaver-agent/guides/development-installation.md

Why: a contributor sets variables nothing reads and runs scripts that do
not exist.

- `development-installation.md:29` says Node.js 16 or higher → 22 →
  `packaging/omnios/zoneweaver-agent.p5m:20`.
  Why: a 16 host cannot install the dependencies.
- `development-installation.md:102` gives `database.storage` →
  `database.directory` → `config/Database.js:87`.
  Why: the dev database never lands where the page says it will.
- `development-installation.md:150,206-210,340-344` set `CONFIG_PATH`,
  `DEBUG`, `PORT`, `HTTPS_PORT` in the environment → only `CONFIG_PATH`
  is read today and it is itself slated for removal in favour of
  `CONFIG_DIR`; `DEBUG`, `PORT`, `HTTPS_PORT` are never read →
  `config/ConfigLoader.js:31`, `../zoneweaver-agent/notifications.md` section 6.
  Why: three of the four exports change nothing and the fourth teaches
  a mechanism the contract removes.
- `development-installation.md:175,181,222-225` list `npm run docs`,
  `npm run format`, `test: jest` → the scripts are `generate-openapi`,
  `format:check`, `format:fix`, `lint`, `lint:fix`, `quality`, `fix`,
  `sync-versions`; `test` is a stub → `package.json:8-19`.
  Why: `npm run docs` and `npm run format` exit with missing-script
  errors and `npm test` exits 1 by design.
- `development-installation.md:188-193` bootstrap without `setupToken` →
  add it → `controllers/ApiKeys.js:72-78`.
  Why: the request answers 403 unless the dev config disables the claim
  token.
- `development-installation.md:243` queries table `api_keys` → the
  table is `entities` → `models/EntityModel.js:70-71,118`.
  Why: `sqlite3` answers "no such table".
- `development-installation.md:259,351-355,405` call `/api/entities` →
  `/api-keys` → `routes/CoreRoutes.js:209-213`.
  Why: every test and load-test command on the page hits a 404.
- `development-installation.md:265` fetches `/api-docs/openapi.json` →
  `/api-docs/swagger.json` → `lib/SwaggerManager.js:76`.
  Why: the spec fetch answers the Swagger UI's 404 page.
- `development-installation.md:308,326-327` wire routes in
  `routes/index.js` → the per-domain modules `routes/CoreRoutes.js`,
  `MachineRoutes.js`, `MonitoringRoutes.js`, `NetworkRoutes.js`,
  `StorageRoutes.js`, `SystemRoutes.js`, `SystemAdminRoutes.js` →
  `routes/index.js:21-27`.
  Why: a contributor adds a route to the assembler and breaks the
  per-domain layout every other route follows.

### zoneweaver-agent/guides/authentication.md

Why: the key format, the bootstrap body and the status codes are the
three things an integrator copies first, and all three are wrong.

- `authentication.md:33-36` give the format `hw_[random_string]` →
  `hw_<16-character key_id>.<secret>` → `middleware/VerifyApiKey.js:17-20`,
  `models/EntityModel.js:78-84`.
  Why: a validator or a mask written from the page rejects every real
  key, which carries a dot.
- `authentication.md:45-63` bootstrap without `setupToken`; response
  with `entity_id` → the token is required; the response is `api_key`,
  `message`, `note` → `controllers/ApiKeys.js:72-102`.
  Why: the documented request answers 403 and a client parsing
  `entity_id` reads nothing.
- `authentication.md:84` fetches `/zones` → `/machines` →
  `routes/MachineRoutes.js:163`.
  Why: the frontend example answers 404.
- `authentication.md:201` gives `key_length: 32` → 64 →
  `packaging/config/production-config.yaml:45`.
  Why: the documented default is half the shipped one.
- `authentication.md:211` says `401 Unauthorized - Invalid API key` → a
  missing key is 401, an invalid key is 403 →
  `middleware/VerifyApiKey.js:182,193`.
  Why: a client retrying on 401 never sees the 403 the agent sends for
  a bad key.

### zoneweaver-agent/guides/zone-management.md

Why: every example targets a route family the agent deleted, and one
prints a real password.

- `zone-management.md:28-31,44,73,110,140,163,193,231,258,276,295,311,322,335,350,471,476,479,534,580,663,681,733,737`
  use `/zones` and `/zones/:zoneName` → `/machines` and
  `/machines/:machineName` → `routes/MachineRoutes.js:127-128,163-186`.
  Why: every create, modify, delete and provision example on the page
  answers 404.
- `zone-management.md:489` prints the password `STARTcloud24@!` →
  replace with a placeholder.
  Why: a real credential is published on a public docs site.
- `zone-management.md:609,620` call `/provision/cancel` and
  `/provision/rollback` → no such routes; the pipeline exposes
  `provision`, `provision/status`, `sync`, `run-provisioners` →
  `routes/MachineRoutes.js:183-186`.
  Why: an operator trying to stop or undo a provisioning run finds no
  route and the two that exist are undocumented.
- `zone-management.md:727,764` call `POST /zones/:name/halt` and
  `DELETE /zones/:name/force` → `POST /machines/:name/stop`; there is no
  force delete → `routes/MachineRoutes.js:172-179`.
  Why: the recovery procedure ends on two 404s.

### zoneweaver-agent/guides/network-management.md

Why: the examples name a private host, old interface names and a probe
that needs a key.

- `network-management.md:144,170,199,214,240,286,312,351,379,410,419,437,469,504,544,602,630,637,681,718,755,758,842,863`
  use the host `hv-04-backend.home.m4kr.net` → `your-server`.
  Why: a private hostname is published and every copied command targets
  a host the reader cannot reach.
- `network-management.md:568-569` give `estub_provision` and
  `provision_interconnect0` → `zwestub_0` and `provisioning_0` →
  `packaging/config/production-config.yaml:128-129`.
  Why: the troubleshooting `dladm` and `svccfg` checks look for links
  and a listen interface the agent never creates.
- `network-management.md:588,599,602` use `/zones/{name}/provision` and
  `PUT /zones/web-01` → `/machines/...` → `routes/MachineRoutes.js:128,183`.
  Why: both examples answer 404.
- `network-management.md:775` probes `/health` on port 5001 → the public
  probe is `/status` (or `/api/status`); `/monitoring/health` needs a
  key → `routes/CoreRoutes.js:196-197`, `routes/MonitoringRoutes.js:54`.
  Why: the connectivity check from inside a zone answers 404 and the
  reader concludes the network is broken.

### zoneweaver-agent/guides/provisioning.md

Why: the page teaches a removed profiles surface, dead cancel and rollback
routes and a recipe the seeder no longer ships, and prints a real
password.

- `provisioning.md:67,100,110,119,157,164,257,289,374,400,454` use the
  host `hv-04-backend.home.m4kr.net` → `your-server`.
  Why: a private hostname is published and every copied command targets
  a host the reader cannot reach.
- `provisioning.md:129,383` print the password `STARTcloud24@!` →
  replace with a placeholder.
  Why: a real credential is published on a public docs site.
- `provisioning.md:45,367-412,593-601` describe Provisioning profiles
  and `/provisioning/profiles*` → remove; profiles were removed →
  `routes/CoreRoutes.js:130-131`.
  Why: a reader builds a workflow around five endpoints that answer 404
  and a `profile_id` the modify route ignores.
- `provisioning.md:55,67,119,157,164,577-578` use `/zones/*` →
  `/machines/*` → `routes/MachineRoutes.js:127-128,183-184`.
  Why: the quick start fails at its first request.
- `provisioning.md:579-580,454` list `/provision/cancel` and
  `/provision/rollback` → no such routes → `routes/MachineRoutes.js:183-186`.
  Why: the rollback procedure the page relies on does not exist.
- `provisioning.md:195-216` show the `debian-netplan` recipe removing
  `/etc/netplan/*.yaml` and writing `/etc/netplan/config.yaml` → the
  recipe writes the agent-synthesized `{{netplan_yaml}}` to
  `/etc/netplan/60-zoneweaver.yaml` with no remove step →
  `db/seeders/20260209-default-recipes.js:36-37,46-53`.
  Why: a custom recipe modelled on the page deletes cloud-init's own
  netplan file and expects variables the agent does not populate.
