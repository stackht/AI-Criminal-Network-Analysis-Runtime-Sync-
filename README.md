# SECRET — SIH 2026 Showcase Prototype

Premium, cinematic investigative-intelligence showcase for the Smart Entity &
Criminal Relationship Exploration Tool (SECRET). Built for SIH 2026 judging,
large-screen demos and storytelling.

> **PROTOTYPE • SYNTHETIC DATA** — every entity, case, location, transaction,
> call record and relationship in this application is fictional. No real
> criminal information is used. Analytical signals are investigative leads,
> not proof of criminal activity.

## What it demonstrates

```
DATA  →  ENTITIES  →  RELATIONSHIPS  →  INTELLIGENCE
     →  INVESTIGATIVE SIGNAL  →  EVIDENCE  →  ANALYST DECISION
     →  AUDIT / INTEGRITY
```

- Cinematic startup sequence (~2 s).
- Case intelligence overview (Operation Meridian · CASE-2026-041).
- **3D Command Centre** — MapLibre globe with 3D buildings, entity markers,
  cinematic camera, orbit and Three.js marker overlay. Enter via rail or
  `Theatre`.
- Network Intelligence — d3-force 2D mesh. Shapes encode entity type, colors
  encode community. Zoom / pan / focus / isolate.
- Entity dossiers — signals, ego network, timeline, locations, evidence,
  financial footprint.
- Evidence explorer + per-record SHA-256 / Merkle batch integrity chain.
- Investigation timeline.
- What-if simulation — removes an entity and **recomputes real graph
  fragmentation** (the demo story: removing Arjun Mehta splits 2 communities).
- Analyst decision flow — CONFIRM / REJECT / DEFER, written to the audit trail.
- Command palette (`Ctrl+K`), demo mode, 10-step guided tour.

## Deterministic demo corpus

All numbers are real and derived from a single synthetic fixture set
(`src/prototype/data.ts`), never fabricated at render time:

| Metric            | Value |
| ----------------- | ----- |
| Entities          | 47    |
| Relationships     | 126   |
| Evidence records  | 18    |
| Potential links   | 7     |
| Anomalies         | 4     |
| Communities       | 6     |

Seeded PRNG — every refresh shows the same network.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static bundle in dist/
npm run preview    # serve the production build
```

The 3D Command Centre streams OpenFreeMap vector tiles, so it needs network
access. Everything else (all case intelligence) is local and deterministic.

Optimized for 1920×1080; comfortable at 1600×900 and 1440×900.

## Structure

```
src/
├── main.tsx                # entry — renders PrototypeApp
├── types.ts                # shared contracts (map + entity types)
├── store/mapStore.ts       # standalone map store factory
├── components/             # InvestigationMap (3D globe), ErrorBoundary
└── prototype/
    ├── data.ts             # deterministic synthetic corpus
    ├── store.ts            # shell state, selections, decisions
    ├── graph.tsx           # d3-force SVG graph
    ├── styles.css          # isolated design system
    ├── index.tsx           # shell + intro + tour
    ├── commandPalette.tsx  # Ctrl+K palette
    └── views/              # overview, theatre, network, entities,
                            # dossier, evidence, timeline, what-if, integrity
```

This repository is a **standalone showcase build** — it contains only the
prototype experience and the minimum runtime it needs. The full SECRET
production application (backend, case intake, reports, audit, live API
integration) is not part of this repository.