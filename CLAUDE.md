# INFOMASTER

## Business context

Infomaster Formación is a training-course brokerage based in Málaga. Understanding the
real-world operation matters for scoping what this site should eventually do:

- **La jefa** (owner) handles accounting, banking, and client relationships (new and
  repeat) — sometimes visiting clients in person. She collects payments and sometimes
  sets up direct debits ("domiciliar pagos").
- **HISPANEA** (Madrid) is a partner: two comerciales sell courses and run the Madrid
  side of the business.
- Course sales are tracked in two parallel Excel 2013 workbooks — one for Madrid, one
  for Málaga — recording salesperson, company, student, course, dates, price breakdown,
  and the Madrid/Málaga revenue split. Mónica separately keeps her own differently
  organized, simpler workbook that may not reconcile with those numbers.
- The course catalog Madrid and Málaga sell from is itself an Excel file, sourced from
  two suppliers: **VÉRTICE** (recently merged with **CUMLAUDE**) and **ACADEMIA
  INTEGRAL** (which also resells **GRUPO SYSTEM** courses). Both suppliers update their
  own catalogs independently — nothing syncs back to Infomaster's catalog automatically.
- Gmail is used for email, but working files are deliberately kept off Google Drive:
  internet in Málaga centro cuts out frequently (attributed to cyberattacks), so Mónica
  doesn't want the business dependent on Google availability.
- Invoices are handwritten/manual per client: a template filled in by hand from a
  separate Excel database of company info.

## Website mission

Live site today: https://www.infomasterformacion.es/. Client acquisition is almost
entirely word-of-mouth and face-to-face — the website currently does none of the
commercial work, and this has been a slow year for the business. The redesign exists to
change that, and to show Infomaster what their site could be doing for them.

Two horizons:
1. **Now** — rebuild the marketing site to actually convert (course catalog, clear
   CTAs, trust signals), per the design rules below.
2. **Later** — connect the course catalog to a RAG pipeline so the AI chat widget
   (`src/components/chat/`) can answer prospective-student questions grounded in real,
   current course data, sourced from the Excel catalogs described above until/unless a
   proper database replaces them.

## Project layout

This repo root contains a top-level `package.json` (Tailwind CSS + `@tailwindcss/vite` only) and a single app in [infomaster/](infomaster/) — the actual React project.

- [infomaster/](infomaster/) — Vite + React 19 + TypeScript app: the Infomaster Formación site
  - `src/App.tsx` — route table; `src/main.tsx` — entry point (wraps in `BrowserRouter`)
  - `src/components/layout/Layout.tsx` — shared shell (navbar + outlet + footer + chat widget)
  - `src/components/{ui,home,chat}/` — primitives, home sections, AI chat widget
  - `src/data/` — nav, clients, testimonials, headshots. Client/accreditation logos are
    placeholders: fill the `src` field in `data/clients.ts` when the real files arrive.
  - `src/pages/` — Home is complete; Formación/Cursos/Nosotros/Contacto are stubs
  - React Compiler is enabled via `babel-plugin-react-compiler`
  - Linting via `oxlint` (`.oxlintrc.json`)

## Design rules

- Brand colors are `#D93D2D` (red) and `#F8D10F` (yellow); tokens live in the `@theme`
  block of `src/index.css`. **`brand-red` fails AA as text on the cream background** —
  use `brand-red-deep` for red text, and `ink` (never white) for text on yellow.
- Headshots: originals stay in `src/assets/headshots/`; the app serves the WebP
  derivatives in `public/images/headshots/`. Never reference the originals directly.

## IMPORTANT: the AI aurora look is reserved for AI surfaces

The blurred-aurora styling exists so users can tell what is AI from what is not. It must
stay confined to `src/components/chat/`; its tokens are named `--ai-*` and live in
`src/styles/ai.css`, deliberately outside the global `@theme`. Never reuse `.ai-*` classes
or the aurora palette for ordinary buttons, cards, or sections — that erases the signal.

## Commands

Run from `infomaster/`:

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # preview production build
```

## Stack

- React 19, TypeScript, Vite 8
- `react-router` v8 (import from `react-router`, not `react-router-dom`)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- oxlint for linting (not ESLint)

## Skills

The [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill set is installed under `.claude/skills/`. It provides a searchable local database of UI styles, color palettes, font pairings, UX guidelines, and chart types across many stacks (including React + Tailwind). Use it whenever working on this project's UI: page/component design, color/typography choices, layout, accessibility, or animation. Included skills: `ui-ux-pro-max`, `ui-styling`, `design`, `design-system`, `brand`, `banner-design`, `slides`.

## IMPORTANT
never mention "claude" in your commits.