/**
 * PROTOTYPE STATE — isolated from the production stores.
 * View routing, selections, analyst decisions and demo-mode state.
 */
import { create } from "zustand";
import { createMapStore } from "../store/mapStore";
import { meridianCaseMarker } from "./data";

export type ProtoView =
  | "overview"
  | "command-centre"
  | "network"
  | "entities"
  | "entity"
  | "evidence"
  | "timeline"
  | "what-if"
  | "integrity";

export type Decision = "CONFIRM" | "REJECT" | "DEFER";
export type DecisionRecord = { linkId: string; decision: Decision; at: string };

type ShellState = {
  view: ProtoView;
  booted: boolean;
  entering: boolean;
  selectedEntityId: string | null;
  decisions: Record<string, DecisionRecord>;
  flagSet: Record<string, boolean>;
  demoMode: boolean;
  tourRunning: boolean;
  paletteOpen: boolean;
  integrityModal: string | null;

  boot: () => void;
  setView: (view: ProtoView) => void;
  openEntity: (id: string) => void;
  back: () => void;
  recordDecision: (linkId: string, decision: Decision) => void;
  setFlag: (key: string, value: boolean) => void;
  toggleFlag: (key: string) => void;
  setDemoMode: (on: boolean) => void;
  setTourRunning: (on: boolean) => void;
  setPaletteOpen: (on: boolean) => void;
  setIntegrityModal: (evidenceId: string | null) => void;
};

/** Prototype map store bound to the Operation Meridian synthetic markers. */
export const useProtoMapStore = createMapStore({ offlineMarkers: [meridianCaseMarker] });

function afterIntro(view: ProtoView): ProtoView {
  return view === "overview" || view === "command-centre" ? view : "overview";
}

export const useProtoStore = create<ShellState>((set, get) => ({
  view: "command-centre",
  booted: false,
  entering: false,
  selectedEntityId: null,
  decisions: {},
  flagSet: { entities: true, organizations: true, events: true, finance: true },
  demoMode: false,
  tourRunning: false,
  paletteOpen: false,
  integrityModal: null,

  boot: () => set({ booted: true }),

  setView: (view) => set({ view }),

  openEntity: (id) => set({ selectedEntityId: id, view: "entity" }),

  back: () => {
    const { view } = get();
    const fallback: Record<ProtoView, ProtoView> = {
      overview: "command-centre",
      "command-centre": "overview",
      network: "command-centre",
      entities: "command-centre",
      entity: "entities",
      evidence: "command-centre",
      timeline: "command-centre",
      "what-if": "network",
      integrity: "evidence",
    };
    set({ view: afterIntro(fallback[view]) });
  },

  recordDecision: (linkId, decision) => {
    const at = new Date().toISOString();
    set((s) => ({ decisions: { ...s.decisions, [linkId]: { linkId, decision, at } } }));
  },

  setFlag: (key, value) => set((s) => ({ flagSet: { ...s.flagSet, [key]: value } })),

  toggleFlag: (key) => set((s) => ({ flagSet: { ...s.flagSet, [key]: !s.flagSet[key] } })),

  setDemoMode: (on) => set({ demoMode: on }),
  setTourRunning: (on) => set({ tourRunning: on }),
  setPaletteOpen: (on) => set({ paletteOpen: on }),
  setIntegrityModal: (id) => set({ integrityModal: id }),
}));

/**
 * Fly the prototype map camera to an entity's primary recorded location and
 * select it, so the Command Centre behaves like an investigator focusing a
 * subject. Delegates to the map store's unified one-tap focus action.
 */
export function focusEntityOnMap(entityId: string) {
  useProtoMapStore.getState().focusEntity(entityId);
  getShell().setView("command-centre");
}

export function selectEntityOnMap(entityId: string | null) {
  useProtoMapStore.getState().selectEntity(entityId);
}

function getShell() {
  return useProtoStore.getState();
}