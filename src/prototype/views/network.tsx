/**
 * PROTOTYPE — Network Intelligence.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Crosshair } from "lucide-react";
import { ForceGraph, CommunityBars } from "../graph";
import { entities, relationships, potentialLinks, degreeOf, entityById, type ProtoEntity } from "../data";
import { useProtoStore } from "../store";
import { EntityRef, Tag, Kicker } from "../components";
import { DecisionFlowModal } from "./shared";

const FILTERS: { key: string; label: string; types: string[] | null }[] = [
  { key: "all", label: "ALL", types: null },
  { key: "people", label: "PEOPLE", types: ["Person"] },
  { key: "orgs", label: "ORGS", types: ["Organization"] },
  { key: "accounts", label: "ACCOUNTS", types: ["Account"] },
  { key: "assets", label: "ASSETS", types: ["Vehicle", "Phone", "Location"] },
];

export function Network() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [openReview, setOpenReview] = useState<string | null>(null);
  const recordDecision = useProtoStore((s) => s.recordDecision);
  const decisions = useProtoStore((s) => s.decisions);
  const openEntity = useProtoStore((s) => s.openEntity);

  const filterTypes = FILTERS.find((f) => f.key === filter)?.types ?? null;
  const typeSet = filterTypes ? new Set(filterTypes) : undefined;

  const hot = useMemo(
    () =>
      [...entities]
        .map((e) => ({ e, deg: degreeOf(e.id) }))
        .filter((x) => x.deg > 0)
        .sort((a, b) => b.deg - a.deg)
        .slice(0, 6),
    [],
  );

  const selectedEntity: ProtoEntity | undefined = selected ? entityById.get(selected) : undefined;

  return (
    <div className="pt-net-layout">
      <div style={{ display: "flex", flexDirection: "column", gap: 0, minHeight: 0 }}>
        <div className="pt-flex" style={{ marginBottom: 12, flex: "none" }}>
          <Kicker>NETWORK INTELLIGENCE</Kicker>
          <Tag tone="cyan">{entities.length} ENTITIES</Tag>
          <Tag>{relationships.length} RELATIONSHIPS</Tag>
          <Tag tone="violet">6 COMMUNITIES</Tag>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <ForceGraph
            filterTypes={typeSet}
            selectedId={selected}
            onSelect={setSelected}
            focusId={focus}
            onFocusChange={setFocus}
          />
          <div className="pt-net-tag">
            <div className="pt-flex" style={{ gap: 4 }}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`pt-filter-item ${filter === f.key ? "on" : ""}`}
                  onClick={() => setFilter(f.key)}
                  style={{ height: 26, padding: "0 10px", fontSize: 10 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-net-side">
        <motion.div layout style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "14px 16px", background: "rgba(13,17,23,0.82)" }}>
          <div className="pt-hud-kicker">NETWORK DNA</div>
          <div className="pt-dna-row"><span>COMMUNITY COUNT</span><b className="pt-num">6</b></div>
          <div className="pt-dna-row"><span>DENSITY</span><b className="pt-num">0.12</b></div>
          <div className="pt-dna-row"><span>BRIDGE DEPENDENCE</span><b style={{ color: "var(--pt-rose)" }}>HIGH</b></div>
          <div className="pt-dna-row"><span>EVIDENCE COVERAGE</span><b className="pt-num">92%</b></div>
          <div className="pt-dna-row"><span>CLUSTERING</span><b className="pt-num">0.31</b></div>
          <div className="pt-divider" />
          <CommunityBars />
        </motion.div>

        <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "14px 16px", background: "rgba(13,17,23,0.82)" }}>
          <div className="pt-hud-kicker"><Crosshair size={11} /> HOT NODES</div>
          <div className="pt-list-scroll" style={{ maxHeight: 224 }}>
            {hot.map(({ e, deg }, i) => (
              <button key={e.id} type="button" className="pt-list-item" onClick={() => { setSelected(e.id); setFocus(null); }}>
                <span className="pt-mono" style={{ color: "var(--pt-faint)", width: 18 }}>{String(i + 1).padStart(2, "0")}</span>
                <Users size={12} style={{ color: "var(--pt-cyan)" }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                <span className="pt-risk">{deg} LINKS</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid rgba(155,140,255,0.3)", borderRadius: 12, padding: "14px 16px", background: "rgba(14,13,26,0.8)" }}>
          <div className="pt-hud-kicker">POTENTIAL LINKS</div>
          <div className="pt-stack" style={{ gap: 8 }}>
            {potentialLinks.map((link) => {
              const rec = decisions[link.id];
              return (
                <div key={link.id} className="pt-event-item" style={{ borderColor: "rgba(155,140,255,0.24)" }}>
                  <div className="pt-flex" style={{ justifyContent: "space-between" }}>
                    <span className="pt-mono" style={{ color: "var(--pt-violet)" }}>{link.id}</span>
                    <Tag tone={rec ? (rec.decision === "CONFIRM" ? "green" : rec.decision === "REJECT" ? "rose" : "amber") : "violet"}>
                      {rec ? rec.decision : `${Math.round(link.confidence * 100)}%`}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 7 }}>
                    <EntityRef id={link.source} /> <span className="pt-faint">⇄</span> <EntityRef id={link.target} />
                  </div>
                  <div className="pt-flex" style={{ marginTop: 9 }}>
                    <button className="pt-btn pt-btn-ghost" style={{ height: 26, fontSize: 10 }} onClick={() => setOpenReview(link.id)}>REVIEW</button>
                    {!rec && (
                      <button className="pt-btn pt-btn-green" style={{ height: 26, fontSize: 10 }} onClick={() => recordDecision(link.id, "CONFIRM")}>CONFIRM</button>
                    )}
                    {!rec && (
                      <button className="pt-btn" style={{ height: 26, fontSize: 10 }} onClick={() => recordDecision(link.id, "DEFER")}>DEFER</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedEntity && (
        <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 30 }}>
          <div className="pt-hud-entity" style={{ width: 280 }}>
            <div className="pt-entity-title" style={{ fontSize: 14 }}>{selectedEntity.name}</div>
            <div className="pt-entity-id">{selectedEntity.id} · {selectedEntity.type.toUpperCase()}</div>
            <div className="pt-entity-actions">
              <button className="pt-btn pt-btn-primary" style={{ flex: 1, height: 28, fontSize: 10 }} onClick={() => openEntity(selectedEntity.id)}>OPEN DOSSIER</button>
              <button className="pt-btn" style={{ height: 28, fontSize: 10 }} onClick={() => setSelected(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {openReview && <ReviewModal linkId={openReview} onClose={() => setOpenReview(null)} />}
    </div>
  );
}

function ReviewModal({ linkId, onClose }: { linkId: string; onClose: () => void }) {
  const link = potentialLinks.find((l) => l.id === linkId);
  if (!link) return null;
  return <DecisionFlowModal link={link} onClose={onClose} />;
}