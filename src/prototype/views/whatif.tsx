/**
 * PROTOTYPE — What-if simulation (deterministic, graph-truth based).
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, RotateCcw } from "lucide-react";
import { entities, simulateRemoval, type WhatIfResult } from "../data";
import { ForceGraph } from "../graph";
import { CountUp, Tag, Kicker } from "../components";

export function WhatIf() {
  const [subject, setSubject] = useState<string>("ENT-0192");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [running, setRunning] = useState(false);
  const removedIds = useMemo(() => (result ? new Set([result.subject]) : new Set<string>()), [result]);

  const candidates = entities.filter((e) => e.type === "Person" || e.type === "Organization").sort((a, b) => b.risk - a.risk);

  const run = () => {
    setRunning(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(simulateRemoval(subject));
      setRunning(false);
    }, 650);
  };

  const reset = () => {
    setSubject("ENT-0192");
    setResult(null);
  };

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>WHAT-IF SIMULATION</Kicker>
          <h1 className="pt-title">Network impact sandbox</h1>
          <div className="pt-meta">Test hypothetical network changes on an isolated graph copy — the source corpus is never mutated.</div>
        </div>
        <button className="pt-btn" onClick={reset}><RotateCcw size={13} /> RESET</button>
      </div>

      <div className="pt-wi-grid">
        <div className="pt-stack">
          <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
            <div className="pt-hud-kicker"><FlaskConical size={11} /> SCENARIO</div>
            <label className="pt-muted" style={{ fontSize: 11, display: "block", marginBottom: 8 }}>REMOVE ENTITY</label>
            <select
              className="pt-search"
              style={{ width: "100%", height: 38, color: "var(--pt-text)" }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Entity to remove"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name} · {c.id} (risk {c.risk})</option>
              ))}
            </select>
            <button className="pt-btn pt-btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={run} disabled={running}>
              {running ? "SIMULATING…" : "SIMULATE"}
            </button>
            <p className="pt-muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.6 }}>
              The prototype recomputes the real graph: edges removed, downstream impact and community fragmentation come from the relationship corpus, not fabricated numbers.
            </p>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "16px 18px", background: "rgba(13,17,23,0.82)" }}>
                <div className="pt-hud-kicker">SIMULATION RESULT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="pt-panel pt-panel-tight" style={{ background: "transparent" }}>
                    <div className="pt-panel-title">BEFORE</div>
                    <div className="pt-panel-value" style={{ fontSize: 24 }}><CountUp value={result.beforeRelationships} /></div>
                    <div className="pt-panel-sub">RELATIONSHIPS</div>
                  </div>
                  <div className="pt-panel pt-panel-tight" style={{ background: "transparent", borderColor: "rgba(251,113,133,0.4)" }}>
                    <div className="pt-panel-title">AFTER</div>
                    <div className="pt-panel-value" style={{ fontSize: 24, color: "var(--pt-rose)" }}><CountUp value={result.afterRelationships} /></div>
                    <div className="pt-panel-sub">RELATIONSHIPS</div>
                  </div>
                </div>
                <div className="pt-divider" />
                <div className="pt-dna-row"><span>DOWNSTREAM ENTITIES AFFECTED</span><b className="pt-num" style={{ color: "var(--pt-amber)" }}>{result.downstream}</b></div>
                <div className="pt-dna-row"><span>COMMUNITIES BEFORE / AFTER</span><b className="pt-num">{result.communitiesBefore} → {result.communitiesAfter}</b></div>
                <div className="pt-dna-row"><span>FRAGMENTATION</span><b className="pt-num" style={{ color: result.fragmented ? "var(--pt-rose)" : "var(--pt-green)" }}>{result.fragmented ? `+${result.fragmented} SPLIT${result.fragmented > 1 ? "S" : ""}` : "STABLE"}</b></div>
                <div className="pt-dna-row" style={{ alignItems: "flex-start" }}><span>INTERPRETATION</span></div>
                <p className="pt-muted" style={{ fontSize: 11.5, lineHeight: 1.7, marginTop: 4 }}>{result.interpretation}</p>
                <Tag tone="amber">INVESTIGATIVE SIGNAL — NOT PROOF</Tag>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ position: "relative", minHeight: 620 }}>
          <ForceGraph removedIds={removedIds} selectedId={null} onSelect={() => {}} />
          {!result && (
            <div className="pt-net-tag" style={{ top: 12, left: 12, right: "auto" }}>
              <Tag tone="cyan">FULL NETWORK · {entities.length} ENTITIES</Tag>
            </div>
          )}
          {result && (
            <div className="pt-net-tag" style={{ top: 12, left: 12, right: "auto" }}>
              <Tag tone="rose">REMOVED: {result.subject}</Tag>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}