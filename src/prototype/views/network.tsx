/**
 * PROTOTYPE — Network Intelligence.
 * Graph is the hero on the workspace; the inspector is a vertical data rail.
 */
import { useMemo, useState } from "react";
import { ForceGraph, CommunityBars } from "../graph";
import { entities, relationships, potentialLinks, degreeOf, entityById, type ProtoEntity } from "../data";
import { useProtoStore } from "../store";
import { EntityRef, Tag } from "../components";
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
    <div className="pt-ev-layout">
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, gap: 10 }}>
        <div className="pt-band" style={{ padding: "0 0 12px", marginBottom: 0 }}>
          <div>
            <div className="pt-case-id">{entities.length} ENTITIES · {relationships.length} RELATIONSHIPS</div>
            <h1 style={{ fontSize: 22 }}>Network Intelligence</h1>
          </div>
          <div className="pt-flex" style={{ gap: 6 }}>
            <Tag tone="cyan">6 COMMUNITIES</Tag>
            <Tag tone="violet">{potentialLinks.length} POTENTIAL LINKS</Tag>
            <Tag>3 BRIDGES</Tag>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={`pt-filter-item ${filter === f.key ? "on" : ""}`} onClick={() => setFilter(f.key)} style={{ height: 26, padding: "0 10px", fontSize: 10 }}>
              {f.label}
            </button>
          ))}
          <span className="pt-faint" style={{ fontSize: 11, alignSelf: "center", marginLeft: 8 }}>click a node to focus its neighbourhood</span>
        </div>

        <div className="pt-graph-stage" style={{ flex: 1 }}>
          <ForceGraph filterTypes={typeSet} selectedId={selected} onSelect={setSelected} focusId={focus} onFocusChange={setFocus} />
        </div>
      </div>

      <div className="pt-inspector" style={{ width: 316 }}>
        <section className="pt-section">
          <div className="pt-section-head"><span>Network DNA</span></div>
          <div className="pt-dna-row"><span>DENSITY</span><b className="pt-num">0.12</b></div>
          <div className="pt-dna-row"><span>BRIDGE DEPENDENCE</span><b style={{ color: "var(--pt-rose)" }}>HIGH</b></div>
          <div className="pt-dna-row"><span>EVIDENCE COVERAGE</span><b className="pt-num">92%</b></div>
          <div className="pt-hr" style={{ margin: "8px 0" }} />
          <CommunityBars />
        </section>

        <section className="pt-section">
          <div className="pt-section-head"><span>Hot nodes</span></div>
          {hot.map(({ e, deg }, i) => (
            <div key={e.id} className="pt-context-row" style={{ cursor: "pointer" }} onClick={() => { setSelected(e.id); setFocus(null); }}>
              <span className="k">{String(i + 1).padStart(2, "0")} · {e.name}</span>
              <span className="pt-num v" style={{ color: "var(--pt-muted)" }}>{deg} LINKS</span>
            </div>
          ))}
        </section>

        <section className="pt-section">
          <div className="pt-section-head"><span>Potential links</span></div>
          {potentialLinks.map((link) => {
            const rec = decisions[link.id];
            return (
              <div key={link.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--pt-border)" }}>
                <div className="pt-flex" style={{ justifyContent: "space-between", gap: 6 }}>
                  <span className="pt-mono" style={{ color: "var(--pt-faint)", fontSize: 10 }}>{link.id}</span>
                  <Tag tone={rec ? (rec.decision === "CONFIRM" ? "green" : rec.decision === "REJECT" ? "rose" : "amber") : "violet"}>
                    {rec ? rec.decision : `${Math.round(link.confidence * 100)}%`}
                  </Tag>
                </div>
                <div style={{ margin: "6px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ minWidth: 0 }}><EntityRef id={link.source} /></span>
                  <span className="pt-faint" style={{ alignSelf: "center" }}>⇄</span>
                  <span style={{ minWidth: 0 }}><EntityRef id={link.target} /></span>
                </div>
                <div className="pt-flex" style={{ gap: 6 }}>
                  <button className="pt-btn pt-btn-ghost" style={{ height: 24, fontSize: 9.5, padding: "0 8px" }} onClick={() => setOpenReview(link.id)}>REVIEW</button>
                  {!rec && (
                    <button className="pt-btn pt-btn-green" style={{ height: 24, fontSize: 9.5, padding: "0 8px" }} onClick={() => recordDecision(link.id, "CONFIRM")}>CONFIRM</button>
                  )}
                  {!rec && (
                    <button className="pt-btn" style={{ height: 24, fontSize: 9.5, padding: "0 8px" }} onClick={() => recordDecision(link.id, "DEFER")}>DEFER</button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {selectedEntity && (
          <section className="pt-section" style={{ borderTop: "1px solid var(--pt-border)", paddingTop: 12 }}>
            <div className="pt-section-head"><span>Selected entity</span></div>
            <div className="pt-entity-title" style={{ fontSize: 15 }}>{selectedEntity.name}</div>
            <div className="pt-entity-id">{selectedEntity.id} · {selectedEntity.type.toUpperCase()}</div>
            <div className="pt-actions" style={{ marginTop: 8 }}>
              <button className="pt-btn pt-btn-primary" style={{ height: 26, fontSize: 10 }} onClick={() => openEntity(selectedEntity.id)}>OPEN DOSSIER</button>
              <button className="pt-btn" style={{ height: 26, fontSize: 10 }} onClick={() => setSelected(null)}>CLEAR</button>
            </div>
          </section>
        )}
      </div>

      {openReview && <DecisionFlowModal link={potentialLinks.find((l) => l.id === openReview)!} onClose={() => setOpenReview(null)} />}
    </div>
  );
}