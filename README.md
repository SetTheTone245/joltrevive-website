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
npm run dev          # full stack (Express + SQLite) on http://localhost:5000
```

To work on the static build only:

```bash
npm run build:static # outputs to dist/public
npx serve dist/public
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Full-stack dev server (Express + SQLite backend) |
| `npm run build` | Full build — static client **and** the Express server bundle |
| `npm run build:static` | Static client only → `dist/public` (used by CI for Pages) |
| `npm run check` | TypeScript type check |
| `npm start` | Run the built full-stack server |

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which type-checks, builds
the static client, and publishes `dist/public` to GitHub Pages.

### One-time repository setup

In **Settings → Pages**, set **Source** to **GitHub Actions**.

### Static-hosting notes

- `vite.config.ts` sets `base: "./"`, so all asset paths are relative. The site works
  at a domain root, in a subdirectory (like `username.github.io/joltrevive-website/`),
  or opened from the local filesystem.
- Routing is hash-based (`/#/store`), so deep links work on any static host with no
  redirect or rewrite rules.
- `client/src/lib/staticApi.ts` provides a client-side data layer that replaces the
  Express/SQLite backend for static deploys. Repair records are seeded demo data, and
  appointment bookings are persisted to `localStorage`.

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
│   ├── staticApi.ts         # client-side data layer for static hosting
│   └── use-hash-path.ts     # router hook
└── pages/                   # home, finder, store, parts, product, cart, checkout,
                             # repair, track-repair, appointments, contact

server/                      # Express + SQLite (optional; used by `npm run dev`)
shared/schema.ts             # Drizzle schema
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

<!-- CI verification: confirming the PR build check workflow runs. -->
