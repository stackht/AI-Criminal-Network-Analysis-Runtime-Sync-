/**
 * PROTOTYPE — Overview / Case Intelligence workspace.
 * Analytical layout: case band, metric table, network-structure visual,
 * signals inspector, recent activity. No card grids.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { caseMeta, netCounts, potentialLinks, anomalies, entityById, evidenceGaps, integritySummary, timeline, formatTimestamp } from "../data";
import { CountUp, Tag } from "../components";
import { useProtoStore } from "../store";
import { DecisionFlowModal } from "./shared";
import { communityColor, communityMembership } from "../graph";

function NetworkStructureVisual() {
  const W = 420;
  const H = 240;
  const cx = W / 2;
  const cy = H / 2;
  const R = 88;
  const clusters = Array.from({ length: netCounts.communities }, (_, i) => i + 1);
  const counts = clusters.map((c) => communityMembership(c));
  const dots = clusters.map((c, i) => {
    const a = (i / netCounts.communities) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, c };
  });
  return (
    <div className="pt-vis" style={{ width: "100%" }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Network structure by community">
        {dots.map((d) => (
          <line key={`l${d.c}`} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="rgba(255,255,255,0.12)" />
        ))}
        <circle cx={cx} cy={cy} r={8} fill="var(--pt-cyan)" />
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize={7} fill="#061218" style={{ fontFamily: "'IBM Plex Mono',monospace", pointerEvents: "none" }}>HUB</text>
        {dots.map((d) => (
          <g key={`g${d.c}`}>
            <circle cx={d.x} cy={d.y} r={7 + Math.min(14, counts[d.c - 1] * 0.9)} fill={communityColor(d.c)} opacity={0.9} />
            <circle cx={d.x} cy={d.y} r={10 + Math.min(14, counts[d.c - 1] * 0.9)} fill="none" stroke={communityColor(d.c)} opacity={0.35} />
            <text x={d.x} y={d.y + 3} textAnchor="middle" fontSize={8} fill="#090b0e" style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, pointerEvents: "none" }}>{counts[d.c - 1]}</text>
            <text x={d.x} y={d.y + 22} textAnchor="middle" fontSize={8} fill="var(--pt-faint)" style={{ fontFamily: "'IBM Plex Mono',monospace", pointerEvents: "none" }}>C{d.c}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Overview() {
  const setView = useProtoStore((s) => s.setView);
  const [openDecision, setOpenDecision] = useState(false);
  const top = potentialLinks[0];
  const recent = timeline.slice(-6);

  return (
    <div className="pt-stack-lg">
      <div className="pt-band">
        <div>
          <div className="pt-case-id">{caseMeta.caseKey} · {caseMeta.classification} · OPENED {caseMeta.opened} · {caseMeta.owner}</div>
          <h1>{caseMeta.title}</h1>
          <div className="pt-band-meta">Case Intelligence · Operation overview</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div className="pt-panel-sub" style={{ justifyContent: "flex-end", color: "var(--pt-green)", fontWeight: 600 }}>ACTIVE INVESTIGATION</div>
            <div className="pt-meta" style={{ marginTop: 3 }}>Updated 20 AUG 2026</div>
          </div>
          <div className="pt-actions">
            <button className="pt-btn pt-btn-primary" onClick={() => setView("command-centre")}>
              COMMAND CENTRE <ArrowRight size={13} />
            </button>
            <button className="pt-btn" onClick={() => setView("network")}>NETWORK INTELLIGENCE</button>
          </div>
        </div>
      </div>

      <div className="pt-split-6535">
        <div className="pt-stack-lg">
          <section className="pt-section">
            <h2 className="pt-section-head">CASE ACTIVITY</h2>
            <table className="pt-metrics">
              <thead>
                <tr>
                  <th style={{ width: "42%" }}>LABEL</th>
                  <th style={{ width: "14%" }}>VALUE</th>
                  <th>CONTEXT</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Entity records", value: netCounts.entities, ctx: "+8 newly identified" },
                  { label: "Relationships", value: netCounts.relationships, ctx: "across 6 communities" },
                  { label: "Evidence sources", value: netCounts.evidence, ctx: `${integritySummary.evidence_verified} hash-verified` },
                  { label: "Potential links", value: netCounts.potentialLinks, ctx: "2 emerging relationships" },
                  { label: "Anomalies", value: netCounts.anomalies, ctx: "1 high-severity pattern" },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="c-label">{row.label}</td>
                    <td className="c-value"><b className="pt-num"><CountUp value={row.value} /></b></td>
                    <td style={{ color: "var(--pt-faint)", fontSize: 12 }}>{row.ctx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="pt-section">
            <div className="pt-section-head">
              <span>Network structure</span>
              <span style={{ fontWeight: 400 }}>{netCounts.communities} communities · bridge at ENT-0192</span>
            </div>
            <NetworkStructureVisual />
          </section>

          <section className="pt-section">
            <h2 className="pt-section-head">Recent case activity</h2>
            <table className="pt-table">
              <thead>
                <tr>
                  <th>WHEN</th><th>EVENT</th><th>TYPE</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((ev) => (
                  <tr key={ev.id}>
                    <td className="pt-mono" style={{ color: "var(--pt-faint)" }}>{formatTimestamp(ev.timestamp).slice(0, 16)}</td>
                    <td style={{ color: "var(--pt-text)" }}>{ev.description}</td>
                    <td className="pt-mono" style={{ color: "var(--pt-muted)" }}>{ev.type.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="pt-inspector">
          <section className="pt-section">
            <div className="pt-section-head"><span>Investigative signals</span><Tag tone="violet">PLINK-01</Tag></div>
            <div style={{ padding: "10px 0", borderBottom: "1px solid var(--pt-border)" }}>
              <div className="pt-entity-title" style={{ fontSize: 14 }}>{entityById.get(top.source)?.name}</div>
              <div className="pt-mono" style={{ color: "var(--pt-faint)", fontSize: 10, margin: "4px 0" }}>via {entityById.get(top.via)?.name}</div>
              <div className="pt-entity-title" style={{ fontSize: 14 }}>{entityById.get(top.target)?.name}</div>
              <div className="pt-flex" style={{ marginTop: 10 }}>
                <Tag tone="violet">CONFIDENCE {Math.round(top.confidence * 100)}%</Tag>
                <Tag>REQUIRES ANALYST VALIDATION</Tag>
              </div>
              <div className="pt-actions" style={{ marginTop: 10 }}>
                <button className="pt-btn pt-btn-violet" style={{ height: 28, fontSize: 10.5 }} onClick={() => setOpenDecision(true)}>REVIEW &amp; DECIDE</button>
                <button className="pt-btn pt-btn-ghost" style={{ height: 28, fontSize: 10.5 }} onClick={() => setView("network")}>IN NETWORK</button>
              </div>
            </div>
          </section>

          <section className="pt-section">
            <h2 className="pt-section-head">Active anomalies</h2>
            {anomalies.map((a) => (
              <div key={a.id} className="pt-context-row">
                <span className="k">{a.severity === "HIGH" ? "HIGH" : "MED"} · {a.id}</span>
                <span className="v">{a.score}</span>
              </div>
            ))}
          </section>

          <section className="pt-section">
            <h2 className="pt-section-head">Evidence gaps · {evidenceGaps.length} unresolved</h2>
            {evidenceGaps.map((g) => (
              <div key={g.id} className="pt-context-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <span className="k" style={{ color: g.priority === "HIGH" ? "var(--pt-amber)" : "var(--pt-faint)" }}>{g.priority} · {g.id}</span>
                <span className="v" style={{ textAlign: "left", fontSize: 11.5 }}>{g.missing}</span>
              </div>
            ))}
          </section>

          <section className="pt-section">
            <h2 className="pt-section-head">Evidence integrity</h2>
            <div className="pt-context-row"><span className="k">CHAIN</span><span className="v" style={{ color: "var(--pt-green)" }}><ShieldCheck size={11} style={{ verticalAlign: -1 }} /> {integritySummary.chain_status}</span></div>
            <div className="pt-context-row"><span className="k">HASH-VERIFIED</span><span className="pt-num v">{integritySummary.evidence_verified}</span></div>
            <div className="pt-context-row"><span className="k">AUDIT TRAIL</span><span className="v" style={{ color: "var(--pt-green)" }}>ACTIVE</span></div>
            <p className="pt-faint" style={{ fontSize: 11, margin: "10px 0 0", lineHeight: 1.6 }}>
              Integrity verifies records are unmodified — it does not prove any relationship is true.
            </p>
            <button className="pt-btn pt-btn-ghost" style={{ marginTop: 6, height: 26, fontSize: 10.5 }} onClick={() => setView("integrity")}>OPEN INTEGRITY LEDGER</button>
          </section>

          <button className="pt-btn" onClick={() => setView("timeline")} style={{ alignSelf: "flex-start" }}>
            <AlertTriangle size={13} /> INVESTIGATE TIMELINE
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openDecision && <DecisionFlowModal link={top} onClose={() => setOpenDecision(false)} />}
      </AnimatePresence>
    </div>
  );
}