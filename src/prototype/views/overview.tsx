/**
 * PROTOTYPE — Overview / Case Intelligence (dashboard).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ListFilter, Crosshair, AlertTriangle, ShieldCheck, GitBranch, Scale } from "lucide-react";
import { caseMeta, netCounts, potentialLinks, anomalies, entityById, evidenceGaps, integritySummary } from "../data";
import { CountUp, Sparkline, Tag, Kicker, Panel } from "../components";
import { useProtoStore } from "../store";
import { DecisionFlowModal } from "./shared";

const spark = [3, 5, 6, 8, 12, 16, 22, 28, 35, 47];
const sparkR = [12, 18, 26, 34, 47, 61, 78, 95, 108, 126];
const sparkE = [2, 4, 5, 7, 9, 11, 13, 15, 17, 18];

export function Overview() {
  const setView = useProtoStore((s) => s.setView);
  const [openDecision, setOpenDecision] = useState(false);
  const top = potentialLinks[0];

  const stats = [
    { label: "NETWORK ENTITIES", value: netCounts.entities, sub: "+8 newly identified", points: spark },
    { label: "RELATIONSHIPS", value: netCounts.relationships, sub: "6 communities mapped", points: sparkR },
    { label: "EVIDENCE SOURCES", value: netCounts.evidence, sub: `${integritySummary.evidence_verified} hash-verified`, points: sparkE },
    { label: "POTENTIAL LINKS", value: netCounts.potentialLinks, sub: "2 emerging relationships", points: [0, 1, 1, 2, 3, 3, 4, 5, 6, 7] },
    { label: "ANOMALIES", value: netCounts.anomalies, sub: "1 high-severity pattern", points: [0, 1, 1, 2, 2, 3, 3, 3, 4, 4] },
  ];

  const intelligence = [
    { label: "NETWORK STRUCTURE", value: `${netCounts.communities} communities detected`, icon: <GitBranch size={13} /> },
    { label: "BRIDGE ENTITIES", value: "ENT-0192 · ENT-0211 · ENT-0187", icon: <Crosshair size={13} /> },
    { label: "TEMPORAL SIGNAL", value: "2 emerging relationships (18–20 AUG)", icon: <ArrowRight size={13} /> },
    { label: "ANOMALIES", value: `${netCounts.anomalies} unusual activity patterns`, icon: <AlertTriangle size={13} /> },
    { label: "EVIDENCE GAPS", value: `${netCounts.gaps} areas requiring verification`, icon: <Scale size={13} /> },
  ];

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>CASE INTELLIGENCE</Kicker>
          <h1 className="pt-title">{caseMeta.title}</h1>
          <div className="pt-meta">
            <span className="pt-mono">{caseMeta.caseKey}</span> · {caseMeta.classification} · OPENED {caseMeta.opened} · STATUS{" "}
            <span className="pt-up" style={{ fontWeight: 700 }}>{caseMeta.status}</span>
          </div>
        </div>
        <div className="pt-actions">
          <button className="pt-btn pt-btn-primary" onClick={() => setView("command-centre")}>
            ENTER 3D COMMAND CENTRE <ArrowRight size={14} />
          </button>
          <button className="pt-btn pt-btn-violet" onClick={() => setView("network")}>
            <ListFilter size={14} /> NETWORK INTELLIGENCE
          </button>
        </div>
      </div>

      <div className="pt-ov-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
          >
            <Panel className="pt-panel-hover">
              <div className="pt-section-gap" style={{ margin: 0 }} />
              <div className="pt-panel-title">{s.label}</div>
              <div className="pt-panel-value" style={{ color: "var(--pt-cyan)" }}>
                <CountUp value={s.value} />
              </div>
              <div className="pt-panel-sub">
                {s.label === "ANOMALIES" ? <span className="pt-warn">▲</span> : <span className="pt-up">▲</span>}
                <span>{s.sub}</span>
              </div>
              <div className="pt-divider" />
              <Sparkline points={s.points} className="" />
            </Panel>
          </motion.div>
        ))}
      </div>

      <div className="pt-ov-row">
        <div className="pt-ov-left">
          <Panel>
            <div className="pt-hud-kicker">INTELLIGENCE SUMMARY</div>
            <div>
              {intelligence.map((row) => (
                <div key={row.label} className="pt-dna-row">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--pt-faint)", font: "600 10px/1 'IBM Plex Mono',monospace", letterSpacing: "0.14em" }}>
                    {row.icon}
                    {row.label}
                  </span>
                  <b style={{ fontSize: 12 }}>{row.value}</b>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="pt-hud-kicker">ACTIVE ANOMALIES</div>
            <div className="pt-stack" style={{ gap: 8 }}>
              {anomalies.map((a) => (
                <div key={a.id} className="pt-event-item" style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <Tag tone={a.severity === "HIGH" ? "rose" : "amber"}>{a.severity}</Tag>
                  <span style={{ color: "var(--pt-text)", fontSize: 12.5 }}>{a.title}</span>
                  <span className="pt-conf" style={{ marginLeft: "auto" }}>{a.score}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="pt-ov-right">
          <Panel className="pt-panel-hover" style={{ borderColor: "rgba(155,140,255,0.4)" }}>
            <div className="pt-hud-kicker" style={{ justifyContent: "space-between" }}>
              <span>ACTIVE ANALYTICAL SIGNAL</span>
              <Tag tone="violet">PLINK-01</Tag>
            </div>
            <div className="pt-entity-title" style={{ fontSize: 15 }}>
              {entityById.get(top.source)?.name}
            </div>
            <div style={{ color: "var(--pt-faint)", font: "500 11px/1 'IBM Plex Mono',monospace", margin: "6px 0" }}>↓ {entityById.get(top.via)?.name}</div>
            <div className="pt-entity-title" style={{ fontSize: 15 }}>
              {entityById.get(top.target)?.name}
            </div>
            <div className="pt-flex" style={{ marginTop: 12 }}>
              <Tag tone="violet">CONFIDENCE {Math.round(top.confidence * 100)}%</Tag>
              <Tag>INVESTIGATIVE SIGNAL</Tag>
              <Tag>REQUIRES ANALYST VALIDATION</Tag>
            </div>
            <div className="pt-actions" style={{ marginTop: 14 }}>
              <button className="pt-btn pt-btn-violet" onClick={() => setOpenDecision(true)}>
                <Crosshair size={13} /> REVIEW &amp; DECIDE
              </button>
              <button className="pt-btn" onClick={() => setView("network")}>
                VIEW IN NETWORK <ArrowRight size={13} />
              </button>
            </div>
          </Panel>

          <Panel>
            <div className="pt-hud-kicker">EVIDENCE INTEGRITY</div>
            <div className="pt-dna-row">
              <span>CHAIN STATUS</span>
              <b style={{ color: "var(--pt-green)" }}><ShieldCheck size={12} style={{ verticalAlign: -2 }} /> {integritySummary.chain_status}</b>
            </div>
            <div className="pt-dna-row"><span>SOURCES REGISTERED</span><b className="pt-num">{integritySummary.evidence_registered}</b></div>
            <div className="pt-dna-row"><span>HASH-VERIFIED</span><b className="pt-num">{integritySummary.evidence_verified}</b></div>
            <div className="pt-dna-row"><span>MISMATCHES</span><b className="pt-num" style={{ color: integritySummary.mismatches ? "var(--pt-amber)" : "var(--pt-text)" }}>{integritySummary.mismatches}</b></div>
            <div className="pt-dna-row"><span>AUDIT TRAIL</span><b style={{ color: "var(--pt-green)" }}>ACTIVE</b></div>
            <p className="pt-muted" style={{ fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
              Cryptographic integrity verifies that records are unmodified — it does not prove any relationship is true.
            </p>
            <button className="pt-btn pt-btn-ghost" style={{ marginTop: 6 }} onClick={() => setView("integrity")}>
              OPEN INTEGRITY LEDGER <ArrowRight size={13} />
            </button>
          </Panel>

          <Panel>
            <div className="pt-hud-kicker">EVIDENCE GAPS — {evidenceGaps.length} UNRESOLVED</div>
            <div className="pt-stack" style={{ gap: 8 }}>
              {evidenceGaps.slice(0, 2).map((g) => (
                <div key={g.id} className="pt-event-item">
                  <div className="pt-flex">
                    <Tag tone={g.priority === "HIGH" ? "rose" : "amber"}>{g.priority} PRIORITY</Tag>
                    <span className="pt-mono" style={{ color: "var(--pt-faint)" }}>{g.id}</span>
                  </div>
                  <div style={{ color: "var(--pt-text)", fontSize: 12, marginTop: 6 }}>{g.missing}</div>
                </div>
              ))}
            </div>
            <button className="pt-btn" style={{ marginTop: 12 }} onClick={() => setView("timeline")}>
              <AlertTriangle size={13} /> INVESTIGATE
            </button>
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {openDecision && <DecisionFlowModal link={top} onClose={() => setOpenDecision(false)} />}
      </AnimatePresence>
    </div>
  );
}