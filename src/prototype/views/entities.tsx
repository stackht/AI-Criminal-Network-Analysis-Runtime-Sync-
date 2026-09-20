/**
 * PROTOTYPE — Entity registry (filterable). Entity dossier opens on click.
 */
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { entities, netCounts, degreeOf, entityTypeLabel, type ProtoEntity } from "../data";
import { useProtoStore } from "../store";
import { EntityGlyph, Tag, Kicker } from "../components";

const TYPE_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "Person", label: "PERSON" },
  { key: "Organization", label: "ORGANIZATION" },
  { key: "Account", label: "ACCOUNT" },
  { key: "Vehicle", label: "VEHICLE" },
  { key: "Phone", label: "PHONE" },
  { key: "Location", label: "LOCATION" },
];

export function Entities() {
  const openEntity = useProtoStore((s) => s.openEntity);
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [sortRisk, setSortRisk] = useState(true);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = entities.filter(
      (e) =>
        (type === "all" || e.type === type) &&
        (!query ||
          e.name.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query) ||
          (e.aliases ?? []).some((a) => a.toLowerCase().includes(query))),
    );
    return filtered.sort((a, b) => (sortRisk ? b.risk - a.risk : a.id.localeCompare(b.id)));
  }, [type, q, sortRisk]);

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>ENTITY REGISTRY</Kicker>
          <h1 className="pt-title">Entities</h1>
          <div className="pt-meta">
            <span className="pt-num">{netCounts.entities}</span> registered across <span className="pt-num">6</span> communities · deterministic synthetic corpus
          </div>
        </div>
        <div className="pt-actions">
          <button className="pt-btn" style={{ height: 30 }} onClick={() => setSortRisk(!sortRisk)}>
            SORT {sortRisk ? "BY RISK" : "BY ID"}
          </button>
          <div className="pt-search">
            <Search size={13} style={{ color: "var(--pt-faint)" }} />
            <input placeholder="Search entities, aliases, IDs…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search entities" />
          </div>
        </div>
      </div>

      <div className="pt-filterbar">
        {TYPE_FILTERS.map((f) => (
          <button key={f.key} type="button" className={`pt-filter-item ${type === f.key ? "on" : ""}`} onClick={() => setType(f.key)} style={{ height: 28, padding: "0 12px", fontSize: 10.5 }}>
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="pt-panel" style={{ padding: 40, textAlign: "center" }}>
          <p className="pt-muted">No entities match the current filters.</p>
        </div>
      ) : (
        <div className="pt-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="pt-entity-table">
            {rows.map((e: ProtoEntity) => (
              <div key={e.id} className="pt-entity-row" onClick={() => openEntity(e.id)} role="button" tabIndex={0} onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") openEntity(e.id); }}>
                <EntityGlyph type={e.type} />
                <div style={{ minWidth: 0 }}>
                  <div className="pt-name">{e.name}</div>
                  <div className="pt-type">{entityTypeLabel[e.type]}</div>
                </div>
                <span className="pt-id">{e.id}</span>
                <div>
                  <div className="pt-panel-sub" style={{ margin: 0, fontSize: 9.5, color: "var(--pt-faint)" }}>RISK</div>
                  <div className="pt-riskbar" style={{ marginTop: 5 }}><i style={{ width: `${e.risk}%`, background: e.risk > 85 ? "var(--pt-rose)" : e.risk > 70 ? "var(--pt-amber)" : "var(--pt-cyan)" }} /></div>
                </div>
                <span className="pt-num" style={{ color: "var(--pt-muted)", fontSize: 11 }}>{degreeOf(e.id)}</span>
                <Tag tone={e.type === "Person" ? "cyan" : e.type === "Organization" ? "violet" : e.type === "Account" ? "green" : "default"}>
                  C{e.community}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}