/**
 * PROTOTYPE — 3D Command Centre.
 * Reuses the production MapLibre InvestigationMap (globe, 3D buildings,
 * cinematic camera, orbit) bound to the prototype's synthetic dataset through
 * an isolated map store instance. The surrounding HUD is prototype-native.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, MapPin, Layers, ShieldAlert, Network as NetworkIcon, Users } from "lucide-react";
import { InvestigationMap, type MapStatus } from "../../components/InvestigationMap";
import { useProtoMapStore, useProtoStore, focusEntityOnMap } from "../store";
import { entities, entityById, netCounts, potentialLinks, degreeOf, type ProtoEntity } from "../data";
import { EntityGlyph, Tag } from "../components";
import { DecisionFlowModal } from "./shared";

export function CommandCentre() {
  const mapStore = useProtoMapStore;
  const showCases = useProtoMapStore((s) => s.showCases);
  const showLocations = useProtoMapStore((s) => s.showLocations);
  const showRoutes = useProtoMapStore((s) => s.showRoutes);
  const showLabels = useProtoMapStore((s) => s.showLabels);
  const selectedEntityId = useProtoMapStore((s) => s.selectedEntityId);
  const openEntity = useProtoStore((s) => s.openEntity);
  const setView = useProtoStore((s) => s.setView);
  const setFlag = useProtoStore((s) => s.setFlag);
  const flagSet = useProtoStore((s) => s.flagSet);
  const [openDecision, setOpenDecision] = useState(false);
  const [mapStatus, setMapStatus] = useState<MapStatus>("initializing");

  const mapEngineTone = mapStatus === "ready" ? "green" : mapStatus === "degraded" ? "amber" : "default";

  useEffect(() => {
    const s = mapStore.getState();
    s.selectCase("CASE-2026-041");
    s.requestCamera("fit-all");
    s.selectEntity(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topEntities = useMemo(
    () =>
      [...entities]
        .filter((e) => e.type === "Person")
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 8),
    [],
  );

  const selectedEntity: ProtoEntity | undefined = selectedEntityId ? entityById.get(selectedEntityId) : undefined;
  const signal = potentialLinks[0];

  const filterRows = [
    { key: "showCases", label: "OPERATIONS", sub: `${netCounts.entities} ENTITIES` },
    { key: "showLocations", label: "MOVEMENT", sub: "GEOLOCATION NODES" },
    { key: "showRoutes", label: "LINKS", sub: "CROSS-CORRIDOR ROUTES" },
    { key: "showLabels", label: "LABELS", sub: "NODE IDENTIFIERS" },
  ] as { key: "showCases" | "showLocations" | "showRoutes" | "showLabels"; label: string; sub: string }[];

  return (
    <div className="pt-cc-wrap">
      <div className="pt-cc-map">
        <InvestigationMap store={mapStore} onStatus={setMapStatus} />
      </div>

      {/* left HUD */}
      <aside className="pt-hud" aria-label="Command centre controls">
        <div className="pt-hud-panel" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="pt-hud-kicker">
            <span>MAP ENGINE</span>
            <span className={`pt-chip pt-chip-${mapEngineTone}`} style={{ height: 20, padding: "0 7px", fontSize: 8.5, letterSpacing: "0.16em" }}>
              {mapStatus === "ready" ? "READY" : mapStatus.toUpperCase()}
            </span>
          </div>
          <div className="pt-flex" style={{ gap: 6, rowGap: 4 }}>
            <span className="pt-chip pt-chip-cyan" style={{ height: 20, padding: "0 7px", fontSize: 8.5 }}>VECTOR DATA</span>
            <span className="pt-chip" style={{ height: 20, padding: "0 7px", fontSize: 8.5 }}>3D TERRAIN</span>
            <span className="pt-chip" style={{ height: 20, padding: "0 7px", fontSize: 8.5 }}>THREE OVERLAY</span>
          </div>
        </div>

        <div className="pt-hud-panel">
          <div className="pt-hud-kicker">
            <span>THREAT FILTERS</span>
            <Layers size={11} style={{ color: "var(--pt-faint)" }} />
          </div>
          <div className="pt-filter-group">
            {filterRows.map((f) => {
              const active = f.key === "showCases" ? showCases : f.key === "showLocations" ? showLocations : f.key === "showRoutes" ? showRoutes : showLabels;
              return (
                <button
                  key={f.key}
                  type="button"
                  className={`pt-filter-item ${active ? "on" : ""}`}
                  onClick={() => mapStore.getState().toggleFlag(f.key)}
                  aria-pressed={active}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: active ? "var(--pt-cyan)" : "var(--pt-faint)", flex: "none" }} />
                  {f.label}
                  <span className="pt-cfg">{f.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-hud-panel">
          <div className="pt-hud-kicker">
            <span>ENTITY INDEX</span>
            <span className="pt-num" style={{ color: "var(--pt-faint)" }}>{topEntities.length}/{netCounts.entities}</span>
          </div>
          <div className="pt-list-scroll">
            {topEntities.map((e) => (
              <button key={e.id} type="button" className={`pt-list-item ${selectedEntityId === e.id ? "selected" : ""}`} onClick={() => focusEntityOnMap(e.id)}>
                <EntityGlyph type={e.type} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                <span className={`pt-risk ${e.risk > 85 ? "hot" : ""}`}>{e.risk}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* right HUD — selected entity */}
      <aside className="pt-cc-right" aria-label="Entity intelligence">
        <AnimatePresence mode="wait">
          {selectedEntity ? (
            <motion.div
              key={selectedEntity.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.26 }}
              className="pt-hud-entity"
            >
              <div className="pt-flex" style={{ justifyContent: "space-between" }}>
                <div className="pt-entity-name-row">
                  <EntityGlyph type={selectedEntity.type} size={12} />
                  <span className="pt-entity-title">{selectedEntity.name}</span>
                </div>
                <Tag tone={selectedEntity.type === "Person" ? "cyan" : "violet"}>{selectedEntity.type.toUpperCase()}</Tag>
              </div>
              <div className="pt-entity-id">ENTITY-ID: {selectedEntity.id}</div>
              <div className="pt-entity-stats">
                <div className="pt-entity-stat"><span>CONNECTIONS</span><b>{degreeOf(selectedEntity.id)}</b></div>
                <div className="pt-entity-stat"><span>ORGS</span><b>{(selectedEntity.organizations ?? []).length}</b></div>
                <div className="pt-entity-stat"><span>LOCATIONS</span><b>{(selectedEntity.locations ?? []).length}</b></div>
              </div>
              <div className="pt-signal-list">
                {selectedEntity.signals.slice(0, 3).map((sig) => <div key={sig} className="pt-signal-item">{sig}</div>)}
              </div>
              <div className="pt-entity-actions">
                <button className="pt-btn pt-btn-primary" style={{ flex: 1, height: 30, fontSize: 10.5 }} onClick={() => openEntity(selectedEntity.id)}>
                  <ExternalLink size={12} /> VIEW ENTITY
                </button>
                <button className="pt-btn" style={{ flex: 1, height: 30, fontSize: 10.5 }} onClick={() => { mapStore.getState().selectEntity(null); const p = mapStore.getState(); p.requestCamera("fit-all"); }}>
                  <X size={12} /> DESELECT
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-hud-panel"
            >
              <div className="pt-hud-kicker">THEATRE ACTIVE</div>
              <div style={{ fontSize: 11.5, color: "var(--pt-muted)", lineHeight: 1.65 }}>
                Select an entity on the globe, or choose one from the index. The camera sustains a cinematic orbit while the network resolves around the subject.
              </div>
              <div className="pt-flex" style={{ marginTop: 10 }}>
                <Tag tone="cyan"><MapPin size={10} /> 11 GEONODES</Tag>
                <Tag>{netCounts.relationships} LINKS</Tag>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* bottom HUD */}
      <footer className="pt-cc-bottom" aria-label="Network status">
        <div className="pt-cc-status">
          <span className="live-dot" />
          <span>NETWORK STATUS</span>
          <b className="pt-num">{netCounts.entities}</b><span>ENTITIES</span>
          <b className="pt-num">{netCounts.relationships}</b><span>LINKS</span>
          <b className="pt-num">{netCounts.communities}</b><span>COMMUNITIES</span>
        </div>
        <button type="button" className="pt-signal-card" onClick={() => setOpenDecision(true)} aria-label="Open potential relationship decision flow">
          <div className="pt-conf-ring">{Math.round(signal.confidence * 100)}%</div>
          <div>
            <h4><ShieldAlert size={12} style={{ verticalAlign: -2, color: "var(--pt-violet)" }} /> SIGNAL DETECTED — POTENTIAL RELATIONSHIP</h4>
            <p>{entityById.get(signal.source)?.name} ⇄ {entityById.get(signal.target)?.name} · via {entityById.get(signal.via)?.name} · requires analyst validation</p>
          </div>
          <NetworkIcon size={16} style={{ color: "var(--pt-violet)", flex: "none" }} aria-hidden="true" />
        </button>
        <button type="button" className="pt-hud-panel" style={{ borderColor: "rgba(56,189,248,0.3)", cursor: "pointer" }} onClick={() => setView("network")} aria-label="Open network intelligence">
          <Users size={15} style={{ color: "var(--pt-cyan)" }} />
          <span className="pt-cc-status" style={{ border: "none", background: "transparent", backdropFilter: "none", padding: 0 }}>
            OPEN NETWORK
          </span>
        </button>
      </footer>

      <AnimatePresence>
        {openDecision && <DecisionFlowModal link={signal} onClose={() => setOpenDecision(false)} />}
      </AnimatePresence>
    </div>
  );
}