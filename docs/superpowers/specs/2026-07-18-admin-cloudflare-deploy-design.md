# Deploy `admin` to Cloudflare Workers behind Zero Trust

**Date:** 2026-07-18
**Status:** Approved (design)
**Scope:** `apps/admin` (`@mfranceschit/admin`) only. Does not touch the portfolio's deploy.

## Context

`apps/admin` is a TanStack Start app (full-stack React on Vite 8, SSR) that replaced the
standalone Sanity Studio. It holds a server-only `SANITY_TOKEN` (Sanity write access) behind
its server-function "seam" — the browser never touches Sanity directly. It is built for a
**single trusted user** (client-trusted invoice totals, non-atomic numbering).

Its `CLAUDE.md` names this exact deferral: *"Deployment + auth (Cloudflare Workers + Access) —
local-only for now."* This spec cashes that in.

Because it is SSR (not static like the portfolio, which is Cloudflare Pages), it needs a server
runtime → a Cloudflare **Worker**.

## Decisions

| Choice | Value |
|---|---|
| Target | Cloudflare **Worker** (SSR runtime) |
| Hostname | `admin.mfranceschit.com` (dedicated subdomain, own Access app) |
| Auth | **Cloudflare Access** (Zero Trust) on the hostname + `workers.dev` disabled |
| Login | Email one-time PIN, allow-list `developer@mfranceschit.com` |
| Deploy | **Cloudflare Workers Builds** (native git integration, build on push) |

### Auth model (why edge-only, no in-app auth)

Cloudflare Access gates the hostname *before* the Worker runs; only the allow-listed identity is
forwarded. Access protects a **route/hostname**, not the Worker — a Worker's free `*.workers.dev`
URL is NOT behind Access. So we also disable that route (`workers_dev: false`), leaving **no
unauthenticated path** to the Worker. This matches the app's single-trusted-user design and needs
zero auth code.

Explicitly NOT in scope: in-app JWT verification of `Cf-Access-Jwt-Assertion` (defense-in-depth /
app-level identity). Reconsider only if a second user or audit trails are added.

## Build wiring (in the repo)

1. Add dev deps to `apps/admin` (versions verified at install-time, not from memory):
   `@cloudflare/vite-plugin`, `wrangler`.
2. `apps/admin/vite.config.ts` — add the cloudflare plugin before the others:
   ```ts
   import { cloudflare } from '@cloudflare/vite-plugin';
   // plugins:
   cloudflare({ viteEnvironment: { name: 'ssr' } }),
   tanstackStart(),
   viteReact(),
   ```
   Preserve the existing `tailwindcss()` plugin and the `@` alias.
3. New `apps/admin/wrangler.jsonc`:
   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "mfranceschit-admin",
     "compatibility_date": "2026-07-18",
     "compatibility_flags": ["nodejs_compat"],
     "main": "@tanstack/react-start/server-entry",
     "workers_dev": false,
     "observability": { "enabled": true }
   }
   ```
4. `apps/admin/package.json` — add `"deploy": "vite build && wrangler deploy"` as a manual
   escape hatch (Workers Builds runs the equivalent on push).

## Secrets & config — two distinct classes

- **`SANITY_TOKEN`** (write token) → **Worker secret** (`wrangler secret put SANITY_TOKEN` or
  dashboard). Runtime-only, never in git, survives redeploys.
- **`VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET`** → **build-time public vars**. Workers
  Builds compiles in Cloudflare's environment, so these must be set as **build env vars in the
  Workers Builds config** or client-side Sanity CDN image URLs break. Not secret (id/dataset only).
- **`SANITY_PROJECT_ID` / `SANITY_DATASET` / `SANITY_API_VERSION`** → plain Worker vars (dashboard
  or `wrangler.jsonc` `vars`).

### Secret-exposure guarantee

`SANITY_TOKEN` is never exposed to the browser or committed to git, by three independent walls:
1. Stored as a **Worker secret** (`wrangler secret put`) — never in git, never in `wrangler.jsonc`;
   Cloudflare stores it encrypted and write-only.
2. **Not `VITE_`-prefixed**, so Vite never inlines it into the client bundle — it exists only in
   the SSR/server chunk that runs inside the Worker.
3. The app **seam** already enforces server-only Sanity access (browser calls server functions;
   only the Worker touches Sanity).

The `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` values DO ship to the browser by design, but
are non-secret public identifiers — the same project id/dataset already appear in every public
Sanity CDN image URL the portfolio serves. Access is controlled by the token and dataset
visibility, not by hiding the id.

## Cloudflare setup (dashboard, one-time)

### Workers Builds
- Connect the GitHub repo. It is a **pnpm + Turborepo monorepo**: install from the workspace root
  and build only admin. `@mfranceschit/admin` depends on `workspace:*` `@mfranceschit/ui`, which
  must build first (Turborepo handles ordering).
- Deploy step: `wrangler deploy` from `apps/admin`.
- Set the build-time `VITE_SANITY_*` env vars here.

### DNS + Zero Trust
- Route `admin.mfranceschit.com` to the Worker (custom domain binding).
- Zero Trust → Access → self-hosted application for `admin.mfranceschit.com`; policy: **allow**
  email `developer@mfranceschit.com`; identity method: one-time PIN.

## Risk to verify (not assume)

The admin's server code reads **`process.env.SANITY_TOKEN`** (per its CLAUDE.md), but on
Cloudflare Workers env vars arrive on the `env` binding. With `nodejs_compat` + the Cloudflare
Vite plugin, `process.env` *should* be populated from vars/secrets — but this typechecks green and
can fail at runtime.

**Verification step (required before calling this done):** after first deploy, exercise a
server-function-backed route through `admin.mfranceschit.com` and confirm Sanity reads AND writes
actually work — not just that the build is green.

**Fallback if `process.env` is empty at runtime:** add a small adapter in
`server/sanity/client.ts` to read from the Worker `env` binding, keeping the `process.env` read as
the local-dev path.

### Second risk (found during build verification): fontkit resolves to its browser build

The local Cloudflare build (Task 3) succeeded but printed `IMPORT_IS_UNDEFINED` warnings: in the
SSR/worker bundle, `@react-pdf/font` and `@react-pdf/pdfkit` (the invoice-PDF path) import
`fontkit`, which resolved to `fontkit`'s **browser** build (`browser-module.mjs`) — that build has
no `open`/`openSync` exports (they are Node-fs based). `nodejs_compat` is set, but the *bundler's*
package resolution is still picking the browser conditional export. If the PDF-generation code path
runs on the deployed Worker, `fontkit.open`/`openSync` will be `undefined` and throw.

**Verification (added to Task 8):** exercise the invoice-PDF generation path on the deployed
Worker specifically, not just generic reads/writes. **Likely fix if it throws:** force `fontkit`
to its Node build via `resolve.conditions` or an alias in the admin Vite config for the ssr
environment. This is a known-plausible failure, flagged here so it is verified rather than
discovered in production.

Note also (non-blocking): the worker bundle is large (server chunk ~1.0 MB gzip) — keep an eye on
the Workers compressed-size cap on first deploy.

## Out of scope

- In-app auth / JWT verification (Option 2).
- Any change to the portfolio deploy.
- Hardening the client-trusted invoice totals / non-atomic numbering (single-user is fine).
