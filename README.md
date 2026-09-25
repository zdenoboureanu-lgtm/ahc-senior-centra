# AHC – Senior centra (web)

Multi-tenant web pro síť senior center AHC. Jeden Next.js codebase + jeden Convex backend obsluhují všechny pobočky napříč subdoménami.

## Architektura

- **1× Convex backend** = single source of truth (pobočky, novinky, kariéra, kontakty, dokumenty, …)
- **1× Next.js codebase** (App Router, RSC) hostovaný na Vercelu
- **Subdoménový multi-tenancy** — `proxy.ts` z hostname vyčte branch slug a vloží ho do `x-ahc-branch` headeru. Server komponenty si ho přečtou přes `getBranchSlugFromHeaders()` a načtou data konkrétní pobočky.
  - `stribro.ahc.cz` → web pobočky Stříbro
  - `praha.ahc.cz`   → web pobočky Praha
  - `ahc.cz`         → globální web (přehled poboček, globální kariéra)

Když přidáš pobočku v Convexu (tabulka `branches`), automaticky se objeví v sekci „Další pobočky" ve footeru všech webů, v globálním seznamu a v globální kariéře.

## Setup (poprvé)

```bash
cd web
bun install
bunx convex dev          # interaktivní login + vytvoření dev deploymentu
                         # → vyplní .env.local (NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOYMENT)
                         # → přepíše stuby v convex/_generated reálnými typy

# v jiném terminálu:
bun run dev              # Next.js dev server na http://localhost:3000
```

### Naseedovat Stříbro + 3 ukázkové pobočky

V Convex dashboardu (`bunx convex dashboard`) → Functions → spusť `seed:runStribroSeed`.

### Lokální testování pobočky

Buď přes subdoménu:
```
http://stribro.localhost:3000
```

nebo přes env var (defaultní pobočka když není subdoména):
```bash
echo 'NEXT_PUBLIC_DEV_BRANCH_SLUG=stribro' >> .env.local
```

## Struktura

```
convex/
├── schema.ts                  # Multi-tenant schéma (branches + per-branch obsah)
├── seed.ts                    # Seed mutation
├── lib/types.ts               # Re-export Doc<>/Id<> typů
└── modules/
    ├── branches/{model,queries}.ts
    ├── careers/{model,queries}.ts
    ├── news/{model,queries}.ts
    └── inquiries/{model,mutations}.ts

src/
├── proxy.ts                   # Multi-tenant routing přes subdoménu (Next 16 proxy)
├── app/
│   ├── layout.tsx             # Header + footer + Convex provider
│   ├── page.tsx               # Branch homepage / global homepage podle subdomény
│   ├── o-nas/page.tsx
│   ├── sluzby/page.tsx
│   ├── kontakt/page.tsx
│   ├── kariera/page.tsx
│   ├── novinky/page.tsx
│   └── zadost-o-prijeti/page.tsx
├── features/
│   ├── branch-home/           # Sekce homepage pobočky
│   ├── site/                  # Header, footer, sdílené UI
│   └── contact/               # Formulář pro inquiries
└── common/                    # Provider, branch helper, validators, constants
```

## Deployment na Vercel

1. `bunx convex deploy` — pushne schema + funkce na produkční Convex
2. Push do GitHubu → Vercel auto-deploy
3. V Vercelu nastav env: `NEXT_PUBLIC_CONVEX_URL` (z výstupu `convex deploy`)
4. Přidat doménu `*.ahc.cz` (wildcard) → každá nová pobočka automaticky funguje na své subdoméně

## Přidání nové pobočky

1. Convex dashboard → tabulka `branches` → Insert (slug = subdoména)
2. Per-branch obsah (services, news, team, …) přes dashboard
3. V DNS přidat A/CNAME `slug.ahc.cz` → Vercel
4. Hotovo — web pobočky je live, automaticky se propsala i do global webu a do footerů ostatních poboček

## Stack (dle CTO standardů)

Next.js 16 (App Router) · React 19 · TypeScript strict · Convex · Tailwind 4 · shadcn/ui · react-hook-form + zod · sonner · date-fns · lucide-react · Bun
