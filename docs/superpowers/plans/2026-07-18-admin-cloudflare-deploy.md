# Admin Cloudflare Workers Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy `apps/admin` (TanStack Start, SSR) to a Cloudflare Worker at `admin.mfranceschit.com`, gated by Cloudflare Access (Zero Trust) with no unauthenticated path, and the Sanity write token kept server-only.

**Architecture:** Add the `@cloudflare/vite-plugin` to the admin's Vite build and a `wrangler.jsonc` that points `main` at TanStack Start's server entry with `nodejs_compat` and `workers_dev` disabled. Deploy via Cloudflare Workers Builds (git integration). Cloudflare Access fronts the custom domain; email one-time-PIN allow-lists the single user. `SANITY_TOKEN` lives as an encrypted Worker secret; `VITE_SANITY_*` are non-secret build vars.

**Tech Stack:** TanStack Start (`@tanstack/react-start` ^1.168), Vite 8, `@cloudflare/vite-plugin`, Wrangler, Cloudflare Workers + Workers Builds + Zero Trust Access, pnpm workspaces + Turborepo.

## Global Constraints

- Node manager is **fnm** — prefix node/pnpm with `fnm exec --` in this shell (e.g. `fnm exec -- pnpm ...`).
- **Never write a package version from memory** — resolve via `pnpm add` (records the resolved caret range) / `pnpm info`.
- **Never commit without explicit user instruction.** Steps below stage and *show* the commit command, but the executor must confirm with the user before running any `git commit`.
- Do **not** run lint/format (`pnpm check`/`format`) — they run in the user's environment.
- Do **not** run `pnpm dev`/`build` for the app casually; the local build in Task 3 is the one intentional exception (needed to verify the Cloudflare build target resolves).
- Design-system HARD rule: no bespoke component markup / raw hex in app code. (This plan touches only config, so no UI code — but the rule stands.)
- Code style: single quotes, trailing commas `all`, 2-space indent, width 100, `import type` for type-only imports.
- Branch first — do not work on `main`. Rebase onto `main`, never merge.

---

### Task 1: Add Cloudflare build dependencies to admin

**Files:**
- Modify: `apps/admin/package.json` (devDependencies)

**Interfaces:**
- Produces: `@cloudflare/vite-plugin` importable in `vite.config.ts`; `wrangler` CLI available for `pnpm --filter @mfranceschit/admin exec wrangler ...`.

- [ ] **Step 1: Create a working branch**

```bash
git checkout -b feat/admin-cloudflare-deploy
```

- [ ] **Step 2: Add the two dev deps (versions resolved by pnpm, not hand-written)**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin add -D @cloudflare/vite-plugin wrangler
```

- [ ] **Step 3: Verify both landed in devDependencies**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin ls @cloudflare/vite-plugin wrangler --depth 0`
Expected: both packages listed with a resolved version. Confirm `apps/admin/package.json` now has `@cloudflare/vite-plugin` and `wrangler` under `devDependencies`.

- [ ] **Step 4: Stage (commit only on user confirmation)**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "build(admin): add @cloudflare/vite-plugin and wrangler"
```

---

### Task 2: Wire the Cloudflare plugin into the admin Vite config

**Files:**
- Modify: `apps/admin/vite.config.ts`

**Interfaces:**
- Consumes: `@cloudflare/vite-plugin` (Task 1).
- Produces: a Vite build whose `ssr` environment is handled by the Cloudflare plugin, so `main: "@tanstack/react-start/server-entry"` resolves against the Worker runtime.

- [ ] **Step 1: Add the cloudflare plugin import and plugin entry**

Edit `apps/admin/vite.config.ts` so it reads exactly:

```ts
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 2: Typecheck the package**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: PASS (no new errors introduced by the config change).

- [ ] **Step 3: Stage (commit only on user confirmation)**

```bash
git add apps/admin/vite.config.ts
git commit -m "build(admin): register @cloudflare/vite-plugin for the ssr environment"
```

---

### Task 3: Add wrangler.jsonc and verify the Cloudflare build target

**Files:**
- Create: `apps/admin/wrangler.jsonc`
- Modify: `apps/admin/.gitignore` (add `dist/`)

**Interfaces:**
- Consumes: the Cloudflare-enabled Vite build (Task 2).
- Produces: a deployable Worker config. `workers_dev: false` removes the `*.workers.dev` route (the Option 3 security decision). `main` + `nodejs_compat` make the SSR entry run on Workers.

- [ ] **Step 1: Create `apps/admin/wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "mfranceschit-admin",
  "compatibility_date": "2026-07-18",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "workers_dev": false,
  "observability": { "enabled": true },
  "vars": {
    "SANITY_DATASET": "production",
    "SANITY_API_VERSION": "2023-12-08"
  }
}
```

Note: `SANITY_PROJECT_ID` is intentionally NOT in `vars` here — set it in the dashboard alongside the build vars in Task 5, to keep the id out of the repo. `SANITY_TOKEN` is a secret (Task 5), never in this file.

- [ ] **Step 2: Ignore the Cloudflare build output**

Add `dist/` as a new line to `apps/admin/.gitignore` (it currently lists `.vinxi/`, `.output/`, `routeTree.gen.ts`, `.env`). Result:

```
.vinxi/
.output/
dist/
routeTree.gen.ts
.env
```

- [ ] **Step 3: Run the local Cloudflare build to prove the target resolves**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin exec vite build`
Expected: build completes; output written to `apps/admin/dist/`. This confirms `@tanstack/react-start/server-entry` and the cloudflare plugin resolve together. (If it fails on a missing `VITE_SANITY_*` at build time, create a local `apps/admin/.env` from `.env.example` first — that file is gitignored.)

- [ ] **Step 4: Stage (commit only on user confirmation)**

```bash
git add apps/admin/wrangler.jsonc apps/admin/.gitignore
git commit -m "build(admin): add wrangler.jsonc worker config, ignore dist"
```

---

### Task 4: Add the deploy script (manual escape hatch)

**Files:**
- Modify: `apps/admin/package.json` (scripts)

**Interfaces:**
- Consumes: `wrangler.jsonc` (Task 3), `wrangler` CLI (Task 1).
- Produces: `pnpm --filter @mfranceschit/admin deploy` → builds then `wrangler deploy`. Workers Builds (Task 6) runs the equivalent on push; this is the manual fallback.

- [ ] **Step 1: Add the `deploy` script**

In `apps/admin/package.json`, add to `scripts`:

```json
"deploy": "vite build && wrangler deploy"
```

- [ ] **Step 2: Dry-run wrangler to validate the config parses**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin exec wrangler deploy --dry-run --outdir=dist`
Expected: wrangler prints the resolved config (name `mfranceschit-admin`, `nodejs_compat`, no `workers.dev` route) and exits 0 without uploading. Requires being logged in for some checks; if it prompts for auth, that's expected and can be deferred to Task 6 — the goal here is that the config *parses*.

- [ ] **Step 3: Stage (commit only on user confirmation)**

```bash
git add apps/admin/package.json
git commit -m "build(admin): add deploy script"
```

---

### Task 5: Configure Cloudflare vars & the Sanity secret (dashboard — user performs)

This task is performed by the user in the Cloudflare dashboard; no repo changes. The executor's job is to hand the user this exact checklist and confirm each item, not to perform it.

- [ ] **Step 1: Set the Worker secret**

After the Worker exists (first deploy in Task 6 creates it), from `apps/admin`:

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec wrangler secret put SANITY_TOKEN
```

Paste the Sanity write token when prompted. Cloudflare stores it encrypted and write-only. (Alternatively: dashboard → Worker → Settings → Variables and Secrets → add secret `SANITY_TOKEN`.)

- [ ] **Step 2: Set the build-time public vars in Workers Builds**

In the Workers Builds settings for this project, add build environment variables:
- `VITE_SANITY_PROJECT_ID` = the project id
- `VITE_SANITY_DATASET` = `production`

These are inlined into the client bundle at build time (needed by `shared/lib/sanityImage.ts`); they are non-secret public identifiers.

- [ ] **Step 3: (No action needed) runtime Sanity vars come from the repo**

`SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_API_VERSION` are all in `wrangler.jsonc` `vars`
(the project id was added there after the whole-branch review, since it is a non-secret public
identifier). The ONLY runtime value set in the dashboard is the `SANITY_TOKEN` secret (Step 1).

- [ ] **Step 4: Confirm no secret is in git**

Run: `git grep -nI "sk" -- apps/admin/wrangler.jsonc; grep -rn "SANITY_TOKEN" apps/admin/wrangler.jsonc`
Expected: `SANITY_TOKEN` does NOT appear in `wrangler.jsonc` (or anywhere tracked). The `.env` holding it locally is gitignored.

---

### Task 6: Connect Workers Builds and do the first deploy (dashboard — user performs)

Performed by the user. Executor hands over this checklist and confirms outcomes.

- [ ] **Step 1: Push the branch and open the PR (only when the user asks)**

```bash
git push -u origin feat/admin-cloudflare-deploy
```

Merge to `main` per the user's normal flow (rebase, no merge commits).

- [ ] **Step 2: Create the Worker via Workers Builds**

Cloudflare dashboard → Workers & Pages → Create → Connect to Git → select the repo. Configure for the monorepo:
- Root directory: `apps/admin`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter @mfranceschit/ui build && pnpm --filter @mfranceschit/admin build` (ensures the `workspace:*` UI dep builds first; Turborepo ordering also handles this if you use `pnpm --filter @mfranceschit/admin... build`)
- Deploy command: `pnpm --filter @mfranceschit/admin exec wrangler deploy`

- [ ] **Step 3: Trigger the first build/deploy and watch logs**

Expected: build succeeds, `wrangler deploy` uploads `mfranceschit-admin`, and the deploy summary shows **no** `workers.dev` route (because `workers_dev: false`).

- [ ] **Step 4: Set the secret now that the Worker exists**

Return to Task 5 Step 1 and set `SANITY_TOKEN`. Re-deploy if the secret was added after the build.

---

### Task 7: Custom domain + Cloudflare Access (dashboard — user performs)

Performed by the user. Executor hands over this checklist.

- [ ] **Step 1: Bind the custom domain**

Dashboard → Worker → Settings → Domains & Routes → Add custom domain → `admin.mfranceschit.com`. Cloudflare provisions the DNS record and cert automatically (the `mfranceschit.com` zone must be on Cloudflare).

- [ ] **Step 2: Create the Access application**

Zero Trust → Access → Applications → Add → Self-hosted. Application domain: `admin.mfranceschit.com`.

- [ ] **Step 3: Add the allow policy**

Policy: action **Allow**, include rule **Emails** = `developer@mfranceschit.com`. Identity method: **One-time PIN** (enabled by default; no IdP setup).

- [ ] **Step 4: Confirm the gate works**

Visit `https://admin.mfranceschit.com` in a fresh/incognito session.
Expected: redirected to the Cloudflare Access one-time-PIN login before the app loads. After entering the emailed code, the admin loads. Confirm the bare Worker has no reachable `*.workers.dev` URL.

---

### Task 8: Runtime verification — Sanity reads AND writes work on the Worker (the real risk)

This is the acceptance gate for the whole plan. The admin's server code reads `process.env.SANITY_TOKEN`; on Workers, env vars normally arrive on the `env` binding. `nodejs_compat` + the Cloudflare Vite plugin *should* populate `process.env`, but this typechecks green and can fail only at runtime.

- [ ] **Step 1: Exercise a read path**

Logged in at `admin.mfranceschit.com`, open a list route (e.g. `/projects`).
Expected: existing Sanity documents render. A blank list or a 500 here means server-side Sanity reads are failing — likely `process.env.SANITY_PROJECT_ID`/token unresolved.

- [ ] **Step 2: Exercise a write path**

Edit a low-stakes field on one document and save (or create then discard a draft).
Expected: the mutation succeeds and the change is reflected on reload. A failure here isolates the write token (`SANITY_TOKEN`) not resolving at runtime.

- [ ] **Step 3: Check Worker logs if either fails**

Dashboard → Worker → Logs (observability is enabled in `wrangler.jsonc`). Look for `undefined` token / project id errors thrown from `server/sanity/client.ts`.

- [ ] **Step 4: Apply the env fallback ONLY if Step 1 or 2 failed on unresolved env**

If `process.env` is empty at runtime, edit `apps/admin/src/server/sanity/client.ts` so the client reads config with a Worker-`env` fallback while keeping `process.env` for local dev. Access the Cloudflare `env` via the TanStack Start server context / `cloudflare:workers` binding (confirm the exact accessor against the installed `@cloudflare/vite-plugin` docs at implementation time — do not guess the import). Re-deploy and repeat Steps 1-2.

- [ ] **Step 5: Exercise the invoice-PDF generation path (fontkit risk)**

The Task 3 build printed `IMPORT_IS_UNDEFINED` for `fontkit.open`/`openSync` — in the worker
bundle `fontkit` resolved to its browser build, which lacks those Node-fs exports. `@react-pdf/font`
and `@react-pdf/pdfkit` (the invoice-PDF path) call them.

Trigger a PDF generation on the deployed Worker: move an invoice out of `draft` (or otherwise hit
the `renderInvoicePdf` path) and confirm the PDF is produced and downloadable.
Expected: PDF generates. A 500 with `open`/`openSync is not a function` (or `undefined`) confirms
the fontkit browser-build issue.

**Fix if it throws:** in `apps/admin/vite.config.ts`, force `fontkit` to its Node build for the ssr
environment — e.g. `resolve: { conditions: [...] }` favoring `node`, or an explicit alias to
`fontkit`'s node entry — then rebuild and re-verify. Confirm the exact resolution mechanism against
the installed `fontkit`/`@react-pdf` package `exports` maps at implementation time; do not guess.

- [ ] **Step 6: Record the outcome**

Note in the spec whether `process.env` resolved as-is and whether the fontkit fix was needed. Commit
any runtime fixes (on user confirmation), e.g.:

```bash
git add apps/admin/src/server/sanity/client.ts
git commit -m "fix(admin): read Sanity config from Worker env with process.env fallback"
```

---

## Self-Review notes

- **Spec coverage:** Build wiring (§Build wiring) → Tasks 1-4. Secrets/config split (§Secrets) → Tasks 3 & 5. Secret-exposure guarantee (§Secret-exposure guarantee) → Task 5 Step 4. Workers Builds (§Cloudflare setup) → Task 6. DNS + Zero Trust (§Cloudflare setup) → Task 7. `workers_dev: false` / no unauthenticated path (§Auth model) → Task 3 Step 1 + Task 6 Step 3 + Task 7 Step 4. Runtime `process.env` risk + fallback (§Risk to verify) → Task 8. Out-of-scope items (in-app JWT, portfolio deploy) → not implemented, as specified.
- **Placeholder scan:** the only deliberately-open item is Task 8 Step 4's exact `env` accessor, which is conditional (needed only if the runtime check fails) and explicitly flagged to verify against installed docs rather than guessed — per the repo's "never assume from memory" rule.
- **Type consistency:** no cross-task types; config keys (`SANITY_TOKEN`, `SANITY_PROJECT_ID`, `VITE_SANITY_*`) are used identically across Tasks 3, 5, 8.
