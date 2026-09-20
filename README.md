# CRIA Showcase — Prototype Overview and Technical Approach

**Product:** CRIA - Criminal Relationship Intelligence & Analytics  
**Descriptor:** Investigative Intelligence Platform  
**Project:** CRIA (SIH 2026 showcase prototype) — the showcase product identity of SECRET  
**Repository:** `stackht/CRIA`  
**Status:** Production-polish standalone demo with React frontend, deterministic synthetic intelligence corpus, MapLibre-based 3D command centre, network analytics visualization, analyst decision flow, and a synthetic evidence integrity ledger.

> **PROTOTYPE • SYNTHETIC DATA** — every entity, case, location, transaction, call record and relationship in this application is fictional. No real criminal information is used. This repository contains only the showcase experience and the minimum runtime it needs; the full production SECRET application (backend, case intake, reports, live API) is a separate product and is not part of this repository.

## 1. Purpose

CRIA is an investigative intelligence and decision-support concept. This repository is a **presentation-focused prototype** built to demonstrate the product story for SIH 2026 judging, large-screen demos and live walkthroughs:

- a cinematic institutional command platform, not a generic admin dashboard;
- case intelligence overview across entities and relationships;
- an interactive 3D command centre over a MapLibre globe with building geometry;
- network intelligence with communities, structural bridges and analytical signals;
- entity dossiers with ego networks, evidence, timeline and financial footprint;
- evidence explorer with per-record integrity metadata;
- what-if simulation that recomputes real graph fragmentation;
- a human-in-the-loop analyst decision flow (CONFIRM / REJECT / DEFER);
- a synthetic integrity/audit ledger.

The platform produces **indicators and evidence-backed investigative leads**. It must not be interpreted as a declaration of guilt. Analytical signals remain potential until an analyst validates them; every demo metric is derived from a deterministic synthetic corpus, never fabricated at render time.

## 2. High-Level Architecture

```text
                  CRIA showcase web experience
       +-----------------------------------------------------------+
       | React 19 + TypeScript + Vite                              |
       | Zustand state | Framer Motion transitions                 |
       | D3 force graph | custom SVG network visuals              |
       | MapLibre GL + Three.js map overlay                       |
       | deterministic synthetic corpus (src/prototype/data.ts)   |
       +-----------------------------------------------------------+
                     no backend / no database / no network API
```

### Main runtime modes

1. **Development:** Vite serves the React application on `http://localhost:5173`.
2. **Static build:** `vite build` produces a self-contained bundle under `dist/`; `vite preview` serves it.
3. **Offline (application logic):** case intelligence requires no server; the full demo corpus ships in the bundle. Only the 3D command centre needs network access for its map tiles.

## 3. Repository Layout

```text
cria-showcase/
├── src/
│   ├── main.tsx                  React bootstrap — renders PrototypeApp
│   ├── types.ts                  shared contracts (map, entity, timeline types)
│   ├── store/
│   │   └── mapStore.ts           standalone map store factory (offline)
│   ├── components/
│   │   ├── InvestigationMap.tsx  MapLibre 3D globe (reused from SECRET)
│   │   └── ErrorBoundary.tsx     resilient view fallback
│   └── prototype/
│       ├── data.ts               deterministic synthetic corpus (single source)
│       ├── store.ts              shell state, view routing, decisions, demo mode
│       ├── graph.tsx             d3-force SVG network graph (shape = type)
│       ├── components.tsx        shared UI primitives (counters, tags, sparks)
│       ├── index.tsx             shell, cinematic intro, guided tour
│       ├── commandPalette.tsx    Ctrl+K command palette
│       ├── styles.css            isolated showcase design system
│       └── views/
│           ├── overview.tsx      case intelligence dashboard
│           ├── commandCentre.tsx 3D command centre HUD
│           ├── network.tsx       network intelligence
│           ├── entities.tsx      entity registry
│           ├── entity.tsx        entity dossier
│           ├── evidence.tsx      evidence explorer
│           ├── timeline.tsx      investigation timeline
│           ├── whatif.tsx        what-if simulation
│           ├── integrity.tsx     integrity / audit ledger
│           └── shared.tsx        decision flow & modals
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md                     this document
```

## 4. Frontend Technical Approach

### 4.1 Application shell and navigation

`src/prototype/index.tsx` owns the persistent shell: header (brand, case breadcrumb, system status, prototype label, clock), compact left rail navigation with animated active states, and a main area that transitions between views with Framer Motion. Views:

- Overview (case intelligence)
- 3D Command Centre (theatre)
- Network Intelligence
- Entity Registry / Entity Dossier
- Evidence Explorer
- Timeline
- What-if Simulation
- Integrity Ledger

A cinematic startup sequence (~2 s) initializes the intelligence engine, then resolves into the shell. `ErrorBoundary` prevents a failed visualization layer from taking down the application.

### 4.2 State management

Zustand is used for lightweight, isolated state:

- `src/prototype/store.ts`: active view, selections, analyst decisions, integrity modal, demo mode, guided-tour state.
- `src/prototype/store.ts` → `useProtoMapStore`: a map store **instance** bound to the Operation Meridian dataset, so the glue around the production-derived 3D map never touches production state.

The shell does not recreate the MapLibre instance on normal React renders. The map is created once inside `InvestigationMap` and receives data through MapLibre GeoJSON sources and layer-visibility changes.

### 4.3 Command centre and 3D map

`src/components/InvestigationMap.tsx` is reused from SECRET with the production store coupling replaced by an injected store instance:

- MapLibre GL JS with the OpenFreeMap vector style (no Mapbox token);
- MapLibre fill-extrusion layers for 3D buildings using real source heights;
- GeoJSON sources for case markers, location markers and routes;
- MapLibre navigation, pitch, and cinematic orbit controls;
- a Three.js custom-layer beacon overlay on the selected target;
- target-relative camera math using `calculateCameraOptionsFromTo` and smooth `easeTo`/`flyTo` transitions, synchronized with a cinematic pitch curve.

The surrounding HUD is prototype-native: threat filters (operations / movement / links / labels), an entity index, a selected-entity intelligence panel, a live network-status strip and a "signal detected" card that opens the analyst decision flow.

### 4.4 Network and analytical visuals

- `src/prototype/graph.tsx` renders the relationship mesh with d3-force. Node **shape** encodes entity type (person, organization, account, vehicle, phone, location), color encodes community — never color alone.
- Support for zoom, pan, fit, selection highlighting, focus/isolation and type filtering.
- Counters and micro-visualizations use the shared primitives in `components.tsx`.

### 4.5 Interaction quality

- Framer Motion page transitions and spring-based modals;
- animated number counters (respecting `prefers-reduced-motion`);
- a Ctrl+K command palette with keyboard navigation over views, entities and evidence;
- a guided 10-step demo tour and a demo-mode toggle in the header.

## 5. Synthetic Data System

All demo numbers are real and derived from a single fixture module `src/prototype/data.ts`:

| Metric            | Value |
| ----------------- | ----- |
| Entities          | 47    |
| Relationships     | 126   |
| Evidence records  | 18    |
| Potential links   | 7     |
| Anomalies         | 4     |
| Communities       | 6     |

- **Deterministic:** a seeded PRNG generates the dataset once; every refresh and every demo shows the same network.
- **Internally consistent:** the same entity/relationship appears identically across the network graph, dossiers, timeline, potential-link views and the command centre.
- **Derived, never invented:** dashboard counts are computed from the corpus; the what-if simulation recomputes edges, downstream impact and community fragmentation (via connected-component search) against the real graph rather than showing canned offsets.

The illustrative demo story: removing **Arjun Mehta** removes 23 relationships and fragments the network into 2 additional components.

## 6. End-to-End Demo Flow

```text
CASE-2026-041 / OPERATION MERIDIAN
        -> case intelligence overview (entities, relationships, signals)
        -> 3D command centre (geographic theatre, entity focus)
        -> network intelligence (communities, bridges)
        -> potential relationship signal (87% confidence, supporting signals)
        -> evidence + timeline (SHA-256 / Merkle batch metadata)
        -> evidence gap flagged
        -> analyst decision: CONFIRM / REJECT / DEFER
        -> integrity verified / audit trail updated
```

The UI communicates this story visually: `DATA -> ENTITIES -> RELATIONSHIPS -> INTELLIGENCE -> INVESTIGATIVE SIGNAL -> EVIDENCE -> ANALYST DECISION -> AUDIT / INTEGRITY`.

## 7. Data Ownership

- There is no backend, database or external API in this repository.
- The complete synthetic corpus lives in `src/prototype/data.ts` (entities, relationships, evidence, timeline, potential links, anomalies, chain records, map markers).
- The integrity ledger is a local deterministic fixture; it records per-evidence SHA-256 + Merkle batch metadata and a chained record list. See section 16 for an accurate description.
- Replacing the synthetic corpus with real data requires a formal security, privacy, retention and access-control review and is explicitly out of scope for a showcase prototype.

## 8. Configuration

The standalone build has no environment secrets, tokens or credentials.

Notes:

- The map style/tiles are fetched from OpenFreeMap over HTTPS; network access is required in the command centre. No provider token is committed.
- Fonts (Inter, IBM Plex Mono) are loaded from Google Fonts by `src/prototype/styles.css`; without network access the shell falls back to system font stacks.
- No database, API key or wallet configuration exists.

## 9. Local Development

### Prerequisites

Node.js 20+ and npm.

### Run the dev server

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`. The showcase boots directly — no login step.

### Production build and preview

```powershell
npm.cmd run build   # static bundle in dist/
npm.cmd run preview # serve the production build
```

The experience is optimized for 1920×1080 and remains comfortable at 1600×900 and 1440×900.

## 10. Testing and Verification

Frontend checks:

```powershell
npx tsc --noEmit   # strict TypeScript check
npm.cmd run build  # Vite production compilation
```

Recommended manual smoke test:

1. Start the dev server and open the application.
2. Confirm the cinematic startup resolves into the overview with correct case counts (47 / 126 / 18 / 7 / 4 / 6).
3. Enter the 3D command centre; verify the MapLibre globe loads, and pan, zoom, rotation, pitch, orbit, reset, fit-all and marker clicks behave.
4. Select an entity in the index; verify the camera flies to its primary location and the intelligence panel updates.
5. Open network intelligence; verify zoom/pan/fit, type filters and community coloring.
6. Open an evidence record; verify the chain-record modal renders its SHA-256 / Merkle batch metadata.
7. Run the what-if simulation; verify the numbers change against the graph and the note "synthetic, not proof" remains visible.
8. Record a CONFIRM decision; verify the audit trail reflects it on the integrity view.
9. Confirm `npx tsc --noEmit` and `npm.cmd run build` pass before presenting.

## 11. Performance Approach

- One MapLibre instance per mounted map; the map layer is mounted only while the command-centre view is active.
- GeoJSON sources are updated in place instead of rebuilding the map or recreating layers.
- Layer visibility drives the filter toggles rather than React-rendered marker trees.
- Building fill-extrusion uses minimum-zoom thresholds so low zoom levels avoid expensive detail.
- Graph layouts are computed once per mount via d3-force and rendered as plain SVG.
- Framer Motion transitions are short and gated to non-reduced-motion users where practical.
- MapLibre, Three.js and event listeners are disposed on teardown.

## 12. Security and Governance Approach

- The repository ships zero secrets, credentials or tokens.
- All corpus data is synthetic; there is no real personal data or criminal information.
- The prototype presents explainable indicators, not accusations; potential links require analyst validation.
- Accessibility: keyboard navigation, labelled buttons, readable contrast, tooltips never being the sole source of information, and `prefers-reduced-motion` respected for entrance/counters where practical.
- Integrity metadata verifies record consistency — it does not prove an interpretation is true.

## 13. Current Technical Trade-offs and Limitations

1. The 3D command centre streams map tiles from OpenFreeMap, so it requires network access; without it the globe does not render (the rest of the application still works).
2. The corpus is a single deterministic case (47 entities / 126 relationships). It is intentionally not a replacement for the production intelligence pipeline.
3. Analytical signals and what-if results are computed locally against the fixture graph — representative, not a substitute for the production backend's algorithms.
4. The integrity ledger is a synthetic fixture with precomputed hashes/batch numbers. It demonstrates the product story and does not claim a real block-producing chain (see section 16).
5. The production bundle volume is dominated by the map/visualization stack; route-level lazy loading could reduce initial payload as the surface grows.
6. The prototype is a showcase experience and is intentionally separate from the production SECRET application.

## 14. Recommended Extension Pattern

To add a capability to the showcase:

1. Extend `src/prototype/data.ts` (or a new fixture module) and keep all derived counts consistent.
2. Add the ability to `src/prototype/store.ts` if it needs shell state.
3. Add a new view under `src/prototype/views/`, register it in `src/prototype/index.tsx` (view switch + rail entry).
4. Reuse the shared primitives in `components.tsx`; avoid inventing numbers at render time.
5. Run `npx tsc --noEmit` and `npm.cmd run build`, then verify the flow once manually.

## 15. Important Files by Responsibility

| Area | Files |
|---|---|
| Bootstrap | `src/main.tsx` |
| Shell, intro, tour | `src/prototype/index.tsx` |
| Global showcase state | `src/prototype/store.ts` |
| Map state | `src/store/mapStore.ts` |
| Synthetic corpus | `src/prototype/data.ts` |
| 3D command centre | `src/components/InvestigationMap.tsx`, `src/prototype/views/commandCentre.tsx` |
| Network graph | `src/prototype/graph.tsx`, `src/prototype/views/network.tsx` |
| Shared UI primitives | `src/prototype/components.tsx` |
| Design system | `src/prototype/styles.css` |
| Command palette | `src/prototype/commandPalette.tsx` |
| Views | `src/prototype/views/` |
| Shared contracts | `src/types.ts` |

## 16. Evidence Integrity Layer (as demonstrated in the prototype)

The showcase represents the CRIA tamper-evident integrity concept for evidence and analytical events. Sensitive evidence is never embedded; the prototype records per-record SHA-256 commitments and Merkle batch numbers, plus a chained record list of applied operations (registration, anomaly raise, analyst decision).

### Accurate description (non-claims)

- The prototype uses a **synthetic, deterministic integrity fixture** (precomputed hashes, batch numbers and chain records). It is a presentation of the product story, not a live or decentralized blockchain network.
- It does not contain cryptocurrency, wallets or tokens.
- A `VERIFIED` integrity value means "the referenced record matches its registered commitment". It does **not** prove guilt or that a relationship is true; potential links remain potential until an analyst confirms them.
- Records flagged `OPEN` (mismatch) remain visible and honest — a verification failure never resolves to silent success.
- The production SECRET application implements authoritative integrity atop PostgreSQL and a permissioned chain (see the SECRET project overview); that implementation is not part of this showcase repository.