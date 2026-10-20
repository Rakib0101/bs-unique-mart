---
name: deploy-cpanel
description: >-
  Deploy BS-UniqueMart to its live cPanel/Passenger host (bsuniquemart.com).
  Use whenever the user asks to deploy, ship, push live, or release this
  project, or asks why a merged change isn't showing up on the live site.
  There is no CI/CD — pushing to GitHub does NOT update production. This is a
  manual build-and-upload process because shell/SSH command execution is
  disabled on the hosting account.
---

# Deploying BS-UniqueMart to cPanel

## Why this is manual

This app runs under cPanel's Node.js Selector + Phusion Passenger on shared
hosting (`rain.cloudswebserver.com`, cPanel user `bsunique`). **Shell access is
disabled on this account** — SSH key auth works for authentication, but the
server rejects command execution ("Shell access is not enabled"). SFTP (file
transfer only) does work. So the deploy path is: build locally → upload the
build via SFTP → use cPanel's HTTP API to extract it into place and restart.

No GitHub Actions or other CI/CD exists for this project (discussed once,
never finished). Every commit on `main` sits unlived-until-deployed.

## One-time setup (only if missing)

**cPanel API token.** Check `.env.local` for `CPANEL_API_TOKEN` first — it's
usually already there and reusable (tokens don't expire quickly; this one
survived from Sept 2026 to Oct 2026 fine). If missing or rejected (401/403),
you cannot create one via API — ask the user to go to cPanel → search
"API Tokens" → **Manage API Tokens** → Create, name it, set ~30-day
expiration, and paste the token back to you. Store it as `CPANEL_API_TOKEN`
in `.env.local` (gitignored) for next time.

**SSH key for SFTP.** The private key is never persisted anywhere durable —
scratchpad directories get cleaned up between sessions, so you will usually
need to generate a fresh keypair each session:

```bash
ssh-keygen -t ed25519 -f "$SCRATCHPAD/ssh/bs_uniquemart_deploy" -N "" -C "bs-uniquemart-deploy-$(date +%Y%m%d)"
cat "$SCRATCHPAD/ssh/bs_uniquemart_deploy.pub"
```

Give the user the public key and these exact steps (two steps, both
required — importing alone is NOT enough):
1. cPanel → search "SSH" → **SSH Access** → **Manage SSH Keys** → **Import Key**
   (paste public key, leave private key blank) → **Import**
2. Back on the key list, click **Manage** next to it → **Authorize**

Verify before trusting it:
```bash
sftp -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new -P 22 \
  bsunique@rain.cloudswebserver.com <<< "pwd"
```
"Permission denied" almost always means step 2 (Authorize) was skipped.

## The permission classifier gotcha

If running under Auto Mode, Bash commands that `curl` the cPanel API host or
`sftp` to it get hard-blocked by the auto-mode classifier — even after the
user verbally approves in chat, and even attempts to self-edit
`.claude/settings.local.json` to allow it are blocked (no self-granted
permissions). The only ways through:
- Ask the user to add `"Bash(*rain.cloudswebserver.com*)"` to
  `permissions.allow` in `.claude/settings.local.json` themselves, or
- Ask the user to turn Auto Mode off for the session (normal per-command
  approval prompts apply instead).

Don't try to route around this via WebFetch or other tools — same intent,
same answer.

## CRITICAL: root config files are NOT synced by the normal deploy — check this first

The deploy below only ships `.next/`. `server.js` calls `next({ dev: false })`
directly (not `next start`, not the generated standalone server), which means
Next re-reads `next.config.ts` **fresh from disk on the server** at every
boot — it does NOT use the config baked into `.next/required-server-files.json`.
The server's `next.config.ts` (and `server.js`, `package.json`) is whatever
was last uploaded as part of a *full source* deploy, which may be far
behind what the repo's `.next` build assumes.

This already caused a real incident: `experimental.serverActions.bodySizeLimit`
was added to fix the 1MB image-upload bug, deployed via the normal `.next`-only
process, and **silently had zero effect** — production kept throwing the exact
same "Body exceeded 1 MB limit" error. `required-server-files.json` correctly
showed the new config; the server's actual `next.config.ts` on disk was still
the Oct 16 original (missing even `output: "standalone"`). Lost significant
time assuming the fix was broken before finding this.

**Before every deploy**, diff the local file against what's live and upload it
alongside `.next` if it differs — this file is tiny, just always check:

```bash
TOKEN=$(grep CPANEL_API_TOKEN .env.local | cut -d'"' -f2)
curl -s -k -H "Authorization: cpanel bsunique:$TOKEN" \
  "https://rain.cloudswebserver.com:2083/execute/Fileman/get_file_content?dir=bsuniquemart-app&file=next.config.ts" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['content'])"
# compare against local next.config.ts — if different, SFTP the local one over:
#   put next.config.ts bsuniquemart-app/next.config.ts
```

The same logic applies to `server.js` and `package.json` if either ever
changes — anything the custom server reads directly from disk at boot,
as opposed to things compiled into `.next` (all app code, routes, components).
When in doubt, re-upload the file and restart; it's cheap insurance.

## The actual deploy steps

```bash
cd /Volumes/Rakib/MyProjects/BS-UniqueMart

# 1. Build locally. (site) pages are rendered dynamically (see
#    app/(site)/layout.tsx `export const dynamic = "force-dynamic"`), so the
#    build does NOT need DATABASE_URL — but using .env.local doesn't hurt.
rm -rf .next
npx dotenv -e .env.local -- npx next build

# 2. Zip ONLY .next, excluding the build cache and the (unused) standalone
#    output — next.config.ts sets output:"standalone" but server.js runs the
#    full `next()` handler directly, so .next/standalone is dead weight here.
rm -f /tmp/bsuniquemart-deploy.zip
zip -rq /tmp/bsuniquemart-deploy.zip .next \
  -x ".next/cache/*" -x ".next/standalone/*" -x "*.DS_Store" -x "*/._*"

# 3. Upload via SFTP to the account's home directory (not inside the app dir).
KEY="$SCRATCHPAD/ssh/bs_uniquemart_deploy"
sftp -i "$KEY" -o BatchMode=yes -P 22 bsunique@rain.cloudswebserver.com <<'EOF'
put /tmp/bsuniquemart-deploy.zip bsuniquemart-deploy.zip
EOF

# 4. Extract it INTO the existing app directory via cPanel's legacy Fileman
#    API (overwrites old .next in place; node_modules is untouched/reused).
TOKEN=$(grep CPANEL_API_TOKEN .env.local | cut -d'"' -f2)
curl -s -k -H "Authorization: cpanel bsunique:$TOKEN" \
  "https://rain.cloudswebserver.com:2083/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fileop&op=extract&sourcefiles=bsuniquemart-deploy.zip&destfiles=bsuniquemart-app&doubledecode=0&overwrite=1"

# 5. Clean up the uploaded zip.
curl -s -k -H "Authorization: cpanel bsunique:$TOKEN" \
  "https://rain.cloudswebserver.com:2083/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fileop&op=unlink&sourcefiles=bsuniquemart-deploy.zip"

# 6. Trigger a Passenger restart — standard convention, Passenger restarts on
#    the next request after this file's mtime changes. No shell needed.
echo "restart $(date +%s)" > /tmp/restart_trigger.txt
sftp -i "$KEY" -o BatchMode=yes -P 22 bsunique@rain.cloudswebserver.com <<'EOF'
put /tmp/restart_trigger.txt bsuniquemart-app/tmp/restart.txt
EOF
rm -f /tmp/restart_trigger.txt /tmp/bsuniquemart-deploy.zip
```

## Verify, don't assume

```bash
sleep 3
curl -s -o /dev/null -w "home: %{http_code}\n" https://bsuniquemart.com/
curl -s https://bsuniquemart.com/ | grep -o '<h1[^>]*>.*</h1>' | head -1
```

Better: grep the live HTML for something specific to the change just
deployed (a new class name, a new string) to prove it's actually live, not
just that the server responds. If the change touches an API route, hit it
for real — a fake-but-realistic test order is fine (clean it up from the
`orders` table afterward using `DATABASE_URL` directly, same as any other
verification against this production DB).

## node_modules note

`node_modules` is already installed on the server from the initial setup
(cPanel's "Run NPM Install" button, one-time, via the Node.js Selector UI —
not available through the API, so this part genuinely needs a human click if
dependencies ever change). mysql2 and bcryptjs are pure-JS with no native
bindings, so `node_modules` rarely needs touching again — most deploys are
just a `.next` swap as above. If `package.json` dependencies changed, you'll
need to ask the user to click "Run NPM Install" in cPanel's Node.js Selector
after this deploy's files land.

## Known host quirks already worked around in code

- MariaDB (not MySQL 8) actually runs here — drizzle's `serial()` emits
  syntax MariaDB rejects; schema uses `int().autoincrement()` instead.
- DB session timezone defaults to `SYSTEM` (Bangladesh time, not UTC) — see
  `lib/db/index.ts`'s `pool.on("connection", ...)` hook which forces
  `SET time_zone = '+00:00'`. Don't remove this; drizzle's own timestamp
  column mapper hardcodes a UTC assumption that depends on it.
- `output: "standalone"` in `next.config.ts` is vestigial — nothing deploys
  `.next/standalone`. Safe to ignore unless someone deliberately switches to
  using it (would also mean rewriting `server.js`).
