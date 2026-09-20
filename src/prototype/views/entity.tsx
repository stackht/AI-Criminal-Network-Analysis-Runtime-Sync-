/**
 * PROTOTYPE — Entity Dossier.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Landmark, MessagesSquare } from "lucide-react";
import { entityById, evidence, timeline, relationships, neighborsOf, caseLocations, degreeOf, entityTypeLabel, formatTimestamp, type ProtoEntity } from "../data";
import { useProtoStore, focusEntityOnMap } from "../store";
import { EntityGlyph, Tag, Kicker, EntityRef } from "../components";
import { NodeShape } from "../graph";

const TABS = ["OVERVIEW", "NETWORK", "TIMELINE", "LOCATIONS", "EVIDENCE", "FINANCIAL"] as const;
type Tab = (typeof TABS)[number];

function EgoGraph({ entity }: { entity: ProtoEntity }) {
  const friends = useMemo(() => neighborsOf(entity.id), [entity.id]);
  const edges = useMemo(() => {
    const set = new Set([entity.id, ...friends]);
    return relationships.filter((r) => set.has(r.source) && set.has(r.target));
  }, [entity.id, friends]);
  const r = 150;
  const cx = 230;
  const cy = 180;
  const positions = new Map<string, { x: number; y: number }>();
  positions.set(entity.id, { x: cx, y: cy });
  friends.forEach((f, i) => {
    const a = (i / Math.max(1, friends.length)) * Math.PI * 2 - Math.PI / 2;
    positions.set(f, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  });
  return (
    <svg viewBox="0 0 460 360" width="100%" height="100%" role="img" aria-label={`Ego network around ${entity.name}`}>
      {edges.map((rel) => {
        const a = positions.get(rel.source);
        const b = positions.get(rel.target);
        if (!a || !b) return null;
        return <line key={rel.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(120,140,170,0.32)" strokeWidth={1} />;
      })}
      {[...positions.entries()].map(([id, p]) => {
        const e = entityById.get(id)!;
        const isEgo = id === entity.id;
        const friendsNow = new Set(friends);
        return (
          <g key={id} transform={`translate(${p.x} ${p.y})`}>
            {isEgo && <circle r={26} fill="none" stroke="var(--pt-cyan)" strokeWidth={1.4} opacity={0.7} />}
            <NodeShape type={e.type} size={isEgo ? 20 : 12} selected={isEgo} neighbor={!isEgo && friendsNow.has(id)} dimmed={false} />
            <text y={-18} textAnchor="middle" fontSize={9} fill={isEgo ? "var(--pt-cyan)" : "var(--pt-muted)"} style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
              {e.name.length > 18 ? `${e.name.slice(0, 17)}…` : e.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function EntityDossier() {
  const id = useProtoStore((s) => s.selectedEntityId);
  const back = useProtoStore((s) => s.back);
  const openEntity = useProtoStore((s) => s.openEntity);
  const [tab, setTab] = useState<Tab>("OVERVIEW");

  const entity = id ? entityById.get(id) : undefined;
  const things = useMemo(() => {
    if (!entity) return null;
    const evs = evidence.filter((e) => e.entities.includes(entity.id));
    const tim = timeline.filter((t) => t.entityIds.includes(entity.id));
    const rels = relationships.filter((r) => r.source === entity.id || r.target === entity.id);
    const next = neighborsOf(entity.id).map((n) => entityById.get(n)).filter((e): e is ProtoEntity => Boolean(e)).sort((a, b) => degreeOf(b.id) - degreeOf(a.id));
    return { evs, tim, rels, next, locs: caseLocations.filter((l) => l.entityIds.includes(entity.id)) };
  }, [entity]);

  if (!entity || !things) {
    return (
      <div className="pt-stack">
        <Kicker>ENTITY DOSSIER</Kicker>
        <p className="pt-muted">No entity selected.</p>
        <button className="pt-btn" onClick={() => openEntity("ENT-0192")}>OPEN PRIMARY SUBJECT</button>
      </div>
    );
  }

  const financial = things.rels.filter((r) => {
    const other = entityById.get(r.source === entity.id ? r.target : r.source);
    return other?.type === "Account" || /TRANSACTION|ESCROW|SETTLEMENT|SIGNATORY|CONTROLLED|BENEFICIARY|ACCESS|OPERATOR|OVERSEAS/.test(r.type);
  });

  return (
    <div className="pt-stack">
      <div className="pt-dossier-head">
        <button className="pt-btn pt-btn-ghost" onClick={back}>
          <ArrowLeft size={14} /> BACK
        </button>
        <EntityGlyph type={entity.type} size={13} />
        <div>
          <div className="pt-dossier-name">
            {entity.name}
            <Tag tone={entity.type === "Person" ? "cyan" : entity.type === "Organization" ? "violet" : "default"} style={{ marginLeft: 10 }}>
              {entityTypeLabel[entity.type]}
            </Tag>
          </div>
          <div className="pt-entity-id" style={{ marginTop: 4 }}>ENTITY-ID: {entity.id} · LAST ACTIVITY {entity.lastActivity}</div>
        </div>
        <div style={{ marginLeft: "auto", minWidth: 260 }}>
          <div className="pt-panel-sub" style={{ justifyContent: "space-between" }}>
            <span>RISK SIGNAL</span>
            <b className="pt-num" style={{ color: entity.risk > 85 ? "var(--pt-rose)" : entity.risk > 70 ? "var(--pt-amber)" : "var(--pt-muted)" }}>{entity.risk}/100</b>
          </div>
          <div className="pt-riskbar" style={{ margin: "6px 0 10px" }}><i style={{ width: `${entity.risk}%`, background: entity.risk > 85 ? "var(--pt-rose)" : entity.risk > 70 ? "var(--pt-amber)" : "var(--pt-cyan)" }} /></div>
          <div className="pt-panel-sub" style={{ justifyContent: "space-between" }}>
            <span>IDENTITY CONFIDENCE</span>
            <b className="pt-num" style={{ color: "var(--pt-green)" }}>{Math.round(entity.confidence)}%</b>
          </div>
        </div>
      </div>

      <div className="pt-dossier-tabs">
        {TABS.map((t) => (
          <button key={t} className={`pt-dtab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {tab === "OVERVIEW" && (
            <div className="pt-dossier-grid">
              <div className="pt-stack">
                <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                  <div className="pt-hud-kicker">ANALYTICAL SIGNALS</div>
                  <div className="pt-signal-list">
                    {(entity.signals.length ? entity.signals : ["No analytical signals — awaiting richer evidence intake."]).map((s) => (
                      <div key={s} className="pt-signal-item">{s}</div>
                    ))}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                  <div className="pt-hud-kicker">PROFILE</div>
                  <div className="pt-dna-row"><span>ALIASES</span><b>{entity.aliases.length ? entity.aliases.join(" · ") : "—"}</b></div>
                  <div className="pt-dna-row"><span>ORGANIZATIONS</span><b>{(entity.organizations ?? []).join(" · ") || "—"}</b></div>
                  <div className="pt-dna-row"><span>PRIMARY LOCATIONS</span><b>{(entity.locations ?? []).join(" · ") || "—"}</b></div>
                  <div className="pt-dna-row"><span>VEHICLES</span><b>{(entity.vehicles ?? []).join(" · ") || "—"}</b></div>
                  <div className="pt-dna-row"><span>PHONES</span><b>{(entity.phones ?? []).join(" · ") || "—"}</b></div>
                  <div className="pt-dna-row"><span>CONNECTIONS</span><b className="pt-num">{degreeOf(entity.id)}</b></div>
                </div>
              </div>
              <div className="pt-stack">
                <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                  <div className="pt-hud-kicker">RELATED EVIDENCE</div>
                  {things.evs.length ? things.evs.slice(0, 6).map((e) => (
                    <div key={e.id} className="pt-dna-row">
                      <span className="pt-mono" style={{ color: "var(--pt-green)" }}>{e.id}</span>
                      <b style={{ fontSize: 11, fontWeight: 500 }}>{e.kind}</b>
                    </div>
                  )) : <p className="pt-muted" style={{ fontSize: 11.5 }}>No evidence linked yet.</p>}
                </div>
                <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                  <div className="pt-hud-kicker">TIMELINE EVENTS</div>
                  {things.tim.length ? things.tim.slice(0, 5).map((t) => (
                    <div key={t.id} className="pt-dna-row">
                      <span className="pt-mono" style={{ color: "var(--pt-cyan)" }}>{formatTimestamp(t.timestamp).slice(0, 6)}</span>
                      <b style={{ fontSize: 11, fontWeight: 500 }}>{t.type.replace(/_/g, " ")}</b>
                    </div>
                  )) : <p className="pt-muted" style={{ fontSize: 11.5 }}>No timeline events.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === "NETWORK" && (
            <div className="pt-dossier-grid">
              <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, overflow: "hidden", background: "rgba(8,10,15,0.7)", minHeight: 420 }}>
                <div className="pt-net-tag" style={{ top: 10, left: 12, right: "auto" }}>
                  <Tag tone="cyan">EGO NETWORK · {things.next.length} DIRECT CONNECTIONS</Tag>
                </div>
                <EgoGraph entity={entity} />
              </div>
              <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)", maxHeight: 420, overflowY: "auto" }}>
                <div className="pt-hud-kicker">DIRECT RELATIONSHIPS</div>
                <div className="pt-rel-list">
                  {things.rels.map((r) => {
                    const other = r.source === entity.id ? r.target : r.source;
                    return (
                      <div key={r.id} className="pt-rel-card">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <EntityRef id={other} />
                        </div>
                        <div className="pt-mid">{r.type.replace(/_/g, " ")}</div>
                        <span className="pt-conf">{Math.round(r.confidence * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "TIMELINE" && (
            <div className="pt-stack">
              {things.tim.length ? (
                <div className="pt-tl">
                  {things.tim.map((t) => (
                    <div key={t.id} className="pt-tl-item">
                      <div className="pt-tl-stamp">{formatTimestamp(t.timestamp).slice(0, 16)}</div>
                      <div className="pt-tl-main">
                        <div className="pt-tl-type">{t.type.replace(/_/g, " ")}</div>
                        <div className="pt-tl-desc">{t.description}</div>
                        <div className="pt-tl-subs">
                          {t.evidenceId && <Tag tone="green">{t.evidenceId}</Tag>}
                        </div>
                      </div>
                      <div style={{ alignSelf: "start", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {t.entityIds.filter((eid) => eid !== entity.id).map((eid) => <EntityRef key={eid} id={eid} />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pt-muted">No timeline events linked to this entity.</p>
              )}
            </div>
          )}

          {tab === "LOCATIONS" && (
            <div className="pt-stack">
              {things.locs.length ? (
                <table className="pt-table">
                  <thead>
                    <tr><th>GEONODE</th><th>NAME</th><th>COORDINATES</th><th>IMPORTANCE</th><th></th></tr>
                  </thead>
                  <tbody>
                    {things.locs.map((l) => (
                      <tr key={l.id}>
                        <td className="pt-mono" style={{ color: "var(--pt-faint)" }}>{l.id}</td>
                        <td style={{ color: "var(--pt-text)" }}>{l.name}</td>
                        <td className="pt-mono" style={{ color: "var(--pt-muted)" }}>{l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</td>
                        <td className="pt-num" style={{ color: "var(--pt-muted)" }}>{Math.round(l.importance * 100)}%</td>
                        <td>
                          <button className="pt-btn pt-btn-primary" style={{ height: 24, fontSize: 9.5, padding: "0 8px" }} onClick={() => focusEntityOnMap(entity.id)}>
                            POSITION ON GLOBE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="pt-muted">No geolocation records linked.</p>
              )}
            </div>
          )}

          {tab === "EVIDENCE" && (
            <div className="pt-stack">
              {things.evs.length ? (
                <table className="pt-table">
                  <thead>
                    <tr><th>ID</th><th>TYPE</th><th>RECORD</th><th>WHEN</th><th>SOURCE</th></tr>
                  </thead>
                  <tbody>
                    {things.evs.map((e) => (
                      <tr key={e.id}>
                        <td className="pt-mono" style={{ color: "var(--pt-cyan)" }}>{e.id}</td>
                        <td><Tag tone="green">{e.kind}</Tag></td>
                        <td style={{ color: "var(--pt-text)" }}>{e.title}</td>
                        <td className="pt-mono" style={{ color: "var(--pt-faint)" }}>{formatTimestamp(e.timestamp).slice(0, 16)}</td>
                        <td style={{ color: "var(--pt-faint)" }}>{e.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="pt-muted">No evidence records linked.</p>
              )}
            </div>
          )}

          {tab === "FINANCIAL" && (
            <div className="pt-dossier-grid">
              <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                <div className="pt-hud-kicker"><Landmark size={11} /> ACCOUNT RELATIONSHIPS</div>
                {financial.length ? (
                  <div className="pt-rel-list">
                    {financial.map((r) => {
                      const other = entityById.get(r.source === entity.id ? r.target : r.source);
                      return (
                        <div key={r.id} className="pt-rel-card">
                          <EntityRef id={other?.id ?? ""} />
                          <div className="pt-mid">{r.type.replace(/_/g, " ")}</div>
                          <span className="pt-conf">{Math.round(r.confidence * 100)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="pt-muted" style={{ fontSize: 11.5 }}>No account relationships recorded.</p>}
              </div>
              <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                <div className="pt-hud-kicker"><MessagesSquare size={11} /> COMMUNICATION LINKS</div>
                {things.rels.filter((r) => {
                  const other = entityById.get(r.source === entity.id ? r.target : r.source);
                  return other?.type === "Phone" || /CONTACT|LINE|LINK|HANDSHAKE/.test(r.type);
                }).map((r) => (
                  <div key={r.id} className="pt-rel-card" style={{ marginBottom: 8 }}>
                    <EntityRef id={r.source === entity.id ? r.target : r.source} />
                    <div className="pt-mid">{r.type.replace(/_/g, " ")}</div>
                    <span className="pt-conf">{Math.round(r.confidence * 100)}%</span>
                  </div>
                ))}
                {entity.type === "Person" && !things.evs.filter((e) => e.kind === "CDR").length && (
                  <p className="pt-muted" style={{ fontSize: 11.5 }}>No CDR records linked yet.</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}