# JoltRevive

Website for **JoltRevive** — lithium-ion battery diagnostics, troubleshooting, repair, refurbishing, and replacement for e-bikes, e-scooters, e-motorcycles, and e-boards.

📍 1401 Blondell Avenue, Bronx, NY 10461 · ☎️ 844-NYC-JOLT · ✉️ Admin@JoltRevive.com

## Live site

Deployed automatically to GitHub Pages on every push to `main`.

## The five systems

| System | Route | What it does |
| --- | --- | --- |
| **Battery Finder** | `/#/finder` | Vehicle type → brand → model → matching battery, across a 546-battery database |
| **Online Store** | `/#/store` | New and refurbished batteries with filters, compare, product pages, cart, and checkout |
| **Battery Parts** | `/#/parts` | 55 parts across 6 categories (cells, BMS, chargers, connectors, enclosures, accessories) |
| **Repair Center** | `/#/repair` | Service menu with labor-only pricing, plus repair tracking at `/#/repair/track` |
| **Appointments** | `/#/appointments` | Calendar-based scheduler with photo upload and confirmation numbers |
| **Support** | `/#/contact` | Contact details, store map, hours, and a floating chat widget |

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for building and bundling
- **Tailwind CSS** with a custom "High-Voltage Industrial" design system
- **TanStack Query** for async state
- **Custom hash router** (`client/src/lib/use-hash-path.ts`) — no server rewrites needed, which is what makes static hosting work cleanly
- Fonts: Clash Display + Satoshi (Fontshare), JetBrains Mono (Google Fonts)

## Local development

```bash
npm install
npm run dev          # full stack (Express + Postgres) on http://localhost:5000
```

To work on the static build only:

```bash
npm run build:static # outputs to dist/public
npx serve dist/public
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Full-stack dev server (Express + Postgres backend) |
| `npm run build` | Full build — static client **and** the Express server bundle |
| `npm run build:static` | Static client only → `dist/public` (used by CI for Pages) |
| `npm run check` | TypeScript type check |
| `npm start` | Run the built full-stack server |

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which type-checks, builds
the static client, and publishes `dist/public` to GitHub Pages.

Pull requests against `main` trigger `.github/workflows/pr-preview.yml`, which type-checks,
builds, reports bundle sizes as a PR comment, and uploads the built site as a downloadable
artifact. Broken code cannot reach `main` unnoticed.

### One-time repository setup

In **Settings → Pages**, set **Source** to **GitHub Actions**. (Already configured.)

### Custom domain (joltrevive.com)

The domain is registered through **Wix** and uses Wix nameservers
(`ns10.wixdns.net`, `ns11.wixdns.net`). To point it at this site, edit the DNS records in
the Wix dashboard (**Domains → joltrevive.com → Manage DNS Records**):

| Type | Host | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `setthetone245.github.io` |

Optional IPv6 (`AAAA` on `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

The `CNAME` target excludes the repository name — it is the GitHub user domain, not the
project URL. Record values are per the
[GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

After DNS propagates, add the domain under **Settings → Pages → Custom domain** and enable
**Enforce HTTPS**. Do this *after* DNS is live: setting it early commits a `CNAME` file that
redirects the working `github.io` URL to a domain that is not yet resolving.

### Static-hosting notes

- `vite.config.ts` sets `base: "./"`, so all asset paths are relative. The site works
  at a domain root, in a subdirectory (like `username.github.io/joltrevive-website/`),
  or opened from the local filesystem.
- Routing is hash-based (`/#/store`), so deep links work on any static host with no
  redirect or rewrite rules.
- `client/src/lib/staticApi.ts` provides a client-side data layer that replaces the
  Express backend for static deploys. Repair records are seeded demo data, and
  appointment bookings are persisted to `localStorage`.

## Backend API

GitHub Pages can only serve static files, so the Express API runs separately as a
serverless function on Vercel, backed by Neon Postgres.

- **Production:** <https://joltrevive-website.vercel.app>
- **Intended domain:** <https://api.joltrevive.com> (already attached to the Vercel
  project; needs an `api` CNAME to `cname.vercel-dns.com` at the DNS host)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness plus database status |
| `GET` | `/api/repairs` | List repair records |
| `GET` | `/api/repairs/:repairNumber` | Look up one repair (404 if unknown) |
| `POST` | `/api/appointments` | Create a booking, returns a confirmation code |
| `GET` | `/api/appointments/:confirmation` | Retrieve a booking |

### How the client chooses a data source

`client/src/lib/api.ts` reads the `VITE_API_BASE_URL` build-time variable:

- **Set** — the client calls the live API, so bookings persist in Postgres and are
  visible across devices.
- **Unset** — the client falls back to `staticApi.ts` and `localStorage`.

The value is a GitHub Actions **repository variable** (Settings → Secrets and
variables → Actions → Variables), so the API URL can change without a code edit.
Re-run the Pages workflow after updating it.

### Architecture notes

- `api/index.ts` is the Vercel entry point; `server/app.ts` is a framework-agnostic
  app factory with no `listen()` call, so the same app serves local dev and
  serverless.
- `server/db.ts` connects lazily. A missing `DATABASE_URL` produces a clean
  `503 {"database":"not_configured"}` instead of a boot crash.
- CORS is an explicit allowlist (`joltrevive.com`, `www.joltrevive.com`,
  `setthetone245.github.io`, localhost dev ports), extendable via the
  `ALLOWED_ORIGINS` environment variable.
- `vercel.json` sets `outputDirectory: "public"` so Vercel serves only a small API
  landing page — the real front end is on GitHub Pages.
- Because `package.json` sets `"type": "module"`, **all relative imports need explicit
  `.js` extensions**. Without them Vercel's dependency tracer omits `server/` and the
  function fails at runtime with `ERR_MODULE_NOT_FOUND`.

### Local backend development

```bash
vercel env pull .env.local   # or set DATABASE_URL manually
npm run dev                  # Express + Vite on http://localhost:5000
```

`.env.local` is gitignored. Never commit a connection string.

## Project structure

```
client/src/
├── App.tsx                  # hash router
├── assets/parts/            # product imagery
├── components/              # header, footer, cards, chat widget, UI primitives
├── context/cart-context.tsx # cart (batteries + parts)
├── lib/
│   ├── batteryCatalog.ts    # 546 batteries, supply-and-demand pricing
│   ├── partsCatalog.ts      # 55 parts, supply-and-demand pricing
│   ├── siteData.ts          # services, hours, contact info
│   ├── api.ts               # live API client, falls back to staticApi.ts
│   ├── staticApi.ts         # client-side data layer for static hosting
│   └── use-hash-path.ts     # router hook
└── pages/                   # home, finder, store, parts, product, cart, checkout,
                             # repair, track-repair, appointments, contact

server/
├── app.ts                   # Express app factory (shared by dev and serverless)
├── db.ts                    # lazy Neon Postgres connection
├── routes.ts                # API routes
├── storage.ts               # queries and idempotent seeding
└── index.ts                 # local dev entry point
api/index.ts                 # Vercel serverless entry point
shared/schema.ts             # Drizzle schema (Postgres)
vercel.json                  # API-only Vercel config
.github/workflows/deploy.yml # GitHub Pages CI
```

## Pricing model

Both the battery and parts catalogs price dynamically rather than using flat values:

- **Per-watt-hour base cost** that varies by vehicle class
- **Brand demand multipliers** — sought-after brands carry a premium
- **Per-item scarcity factors**
- **Stock premiums** on backordered items
- A price floor to keep results realistic

Service pricing covers **labor only**; replacement parts are billed separately, with a
confirmed quote following the $80 diagnostic.

## Image licensing

All product photography is original, generated imagery with no third-party branding,
logos, or trademarks — so it carries no copyright restrictions. Battery listings use
procedurally drawn visuals (`components/battery-visual.tsx`) rather than manufacturer
product photos.
