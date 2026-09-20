/**
 * PROTOTYPE — What-if simulation. Scenario rail | graph | impact rail.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, FlaskConical } from "lucide-react";
import { entities, simulateRemoval, type WhatIfResult } from "../data";
import { ForceGraph } from "../graph";
import { CountUp, Tag } from "../components";

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

  const reset = () => { setSubject("ENT-0192"); setResult(null); };

  return (
    <div className="pt-wi-grid">
      <div className="pt-wi-col">
        <section className="pt-section">
          <div className="pt-section-head"><span>Scenario</span></div>
          <label className="pt-faint" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>REMOVE ENTITY</label>
          <select
            className="pt-search"
            style={{ width: "100%", minWidth: 0 }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Entity to remove"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.id}</option>
            ))}
          </select>
          <button className="pt-btn pt-btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={run} disabled={running}>
            {running ? "SIMULATING…" : "SIMULATE"}
          </button>
          <button className="pt-btn" style={{ width: "100%", marginTop: 6 }} onClick={reset}>
            <RotateCcw size={12} /> RESET
          </button>
          <p className="pt-faint" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.6 }}>
            Impact is recomputed against the real graph: edges removed, downstream reach and community fragmentation are derived from the corpus.
          </p>
        </section>
        {!result && (
          <section className="pt-section">
            <div className="pt-section-head"><span>Baseline</span></div>
            <div className="pt-context-row"><span className="k">RELATIONSHIPS</span><span className="pt-num v">126</span></div>
            <div className="pt-context-row"><span className="k">COMMUNITIES</span><span className="pt-num v">6</span></div>
          </section>
        )}
      </div>

      <div className="pt-graph-stage" style={{ position: "relative" }}>
        <ForceGraph removedIds={removedIds} selectedId={null} onSelect={() => {}} />
        {!result && (
          <div className="pt-net-tag"><Tag tone="cyan">FULL NETWORK</Tag></div>
        )}
        {result && (
          <div className="pt-net-tag"><Tag tone="rose">REMOVED: {result.subject}</Tag></div>
        )}
      </div>

      <div className="pt-wi-col">
        <AnimatePresence>
          {result ? (
            <motion.div key={result.subject} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="pt-section">
                <div className="pt-section-head"><span>Impact</span><FlaskConical size={12} style={{ color: "var(--pt-faint)" }} /></div>
                <div className="pt-wi-banner">
                  <span className="pt-faint" style={{ fontSize: 11 }}>RELATIONSHIPS</span>
                  <span className="pt-wi-big pt-num">{result.beforeRelationships} → <span style={{ color: "var(--pt-rose)" }}>{result.afterRelationships}</span></span>
                </div>
                <div className="pt-context-row"><span className="k">DOWNSTREAM ENTITIES</span><span className="pt-num v">{result.downstream}</span></div>
                <div className="pt-context-row"><span className="k">COMMUNITIES BEFORE / AFTER</span><span className="pt-num v">{result.communitiesBefore} → {result.communitiesAfter}</span></div>
                <div className="pt-context-row">
                  <span className="k">FRAGMENTATION</span>
                  <span className="pt-num v" style={{ color: result.fragmented ? "var(--pt-rose)" : "var(--pt-green)" }}>
                    {result.fragmented ? `+${result.fragmented} SPLIT` : "STABLE"}
                  </span>
                </div>
              </section>
              <section className="pt-section">
                <div className="pt-section-head"><span>Interpretation</span></div>
                <p className="pt-muted" style={{ fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>{result.interpretation}</p>
                <Tag tone="amber" style={{ marginTop: 10 }}>INVESTIGATIVE SIGNAL — NOT PROOF</Tag>
              </section>
            </motion.div>
          ) : (
            <div className="pt-faint" style={{ fontSize: 12, lineHeight: 1.6 }}>
              Run a scenario to see relationships, downstream reach and community fragmentation recomputed from the graph.
            </div>
          )}
        </AnimatePresence>
        <div className="pt-section" style={{ marginTop: "auto" }}>
          <div className="pt-section-head"><span>Reference</span></div>
          <div className="pt-context-row"><span className="k">ARJUN MEHTA DEGREE</span><span className="pt-num v">23</span></div>
          <div className="pt-context-row"><span className="k">ENTITY COUNT</span><span className="pt-num v">47</span></div>
        </div>
      </div>
    </div>
  );
}