/**
 * PROTOTYPE — shared signal & decision components.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { entityById, type PotentialLink } from "../data";
import { useProtoStore, type Decision } from "../store";
import { EntityRef, Tag } from "../components";

const reducedOk = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function effectiveStatus(link: PotentialLink): PotentialLink["status"] {
  const rec = useProtoStore.getState().decisions[link.id];
  if (!rec) return link.status;
  if (rec.decision === "CONFIRM") return "CONFIRMED";
  if (rec.decision === "REJECT") return "REJECTED";
  return "DEFERRED";
}

export function ConfidenceRing({ value, tone = "violet" }: { value: number; tone?: "violet" | "cyan" }) {
  const pct = Math.round(value * 100);
  return (
    <div
      className={`pt-conf-ring ${tone === "cyan" ? "cyan" : ""}`}
      style={{ borderColor: `rgba(${tone === "cyan" ? "86,217,255" : "155,140,255"},0.5)` }}
      role="meter"
      aria-label={`Confidence ${pct} percent`}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {pct}%
    </div>
  );
}

/** Full potential-relationship panel with analyst decision flow. */
export function PotentialLinkPanel({ link, compact = false }: { link: PotentialLink; compact?: boolean }) {
  const decide = useProtoStore((s) => s.recordDecision);
  const record = useProtoStore((s) => s.decisions[link.id]);
  const [justRecorded, setJustRecorded] = useState<string | null>(null);
  const a = entityById.get(link.source);
  const b = entityById.get(link.target);
  const via = entityById.get(link.via);
  const status = record ? (record.decision === "CONFIRM" ? "CONFIRMED" : record.decision === "REJECT" ? "REJECTED" : "DEFERRED") : link.status;

  const onDecision = (d: Decision) => {
    decide(link.id, d);
    setJustRecorded(d);
    window.setTimeout(() => setJustRecorded(null), 2200);
  };

  return (
    <div className="pt-stack">
      <div className="pt-signal-banner" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <ConfidenceRing value={link.confidence} />
        <div>
          <div style={{ font: "600 11px/1 'IBM Plex Mono',monospace", letterSpacing: "0.2em", color: "var(--pt-violet)" }}>POTENTIAL RELATIONSHIP</div>
          <div style={{ fontSize: 13, color: "var(--pt-text)", marginTop: 6 }}>
            <EntityRef id={link.source} />
            <span style={{ color: "var(--pt-faint)", margin: "0 8px" }}>↓</span>
            <EntityRef id={link.via} />
            <span style={{ color: "var(--pt-faint)", margin: "0 8px" }}>↓</span>
            <EntityRef id={link.target} />
          </div>
          <div className="pt-flex" style={{ marginTop: 8 }}>
            <Tag tone={status === "CONFIRMED" ? "green" : status === "REJECTED" ? "rose" : status === "DEFERRED" ? "amber" : "violet"}>{status.toUpperCase()}</Tag>
            <Tag>INVESTIGATIVE SIGNAL</Tag>
            <Tag>REQUIRES ANALYST VALIDATION</Tag>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="pt-panel pt-panel-tight">
          <div className="pt-hud-kicker">SUPPORTING SIGNALS</div>
          <div className="pt-stack" style={{ gap: 6 }}>
            {[
              ...link.supporting_signals.map((s) => ({ label: s, positive: true })),
              ...link.contradictory_signals.map((s) => ({ label: s, positive: false })),
            ].map((s) => (
              <div key={s.label} className="pt-signal-item" style={{ color: s.positive ? "var(--pt-muted)" : "var(--pt-amber)" }}>
                <span style={{ color: s.positive ? "var(--pt-green)" : "var(--pt-amber)", flex: "none" }}>{s.positive ? "✓" : "△"}</span>
                {s.label}
              </div>
            ))}
          </div>
          {a && b && (
            <p style={{ fontSize: 11.5, color: "var(--pt-muted)", margin: "12px 0 0", lineHeight: 1.6 }}>
              Analytics proposes a possible association between <b style={{ color: "var(--pt-text)" }}>{a.name}</b> and <b style={{ color: "var(--pt-text)" }}>{b.name}</b> via <b style={{ color: "var(--pt-text)" }}>{via?.name ?? link.via}</b>. This is an <b style={{ color: "var(--pt-violet)" }}>investigative signal</b>, not proof of criminal activity — the analyst decides.
            </p>
          )}
        </div>
      )}

      <div className="pt-flex" style={{ alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ opacity: justRecorded ? 1 : 0.55, scale: justRecorded ? 1 : 0.98 }}
          transition={{ duration: 0.25 }}
          className="pt-actions"
          style={{ display: "flex", gap: 10, flex: 1 }}
        >
          <button className="pt-btn pt-btn-green" onClick={() => onDecision("CONFIRM")} disabled={Boolean(record)}>
            <Check size={13} /> CONFIRM
          </button>
          <button className="pt-btn" onClick={() => onDecision("REJECT")} disabled={Boolean(record)}>
            <X size={13} /> REJECT
          </button>
          <button className="pt-btn pt-btn-violet" onClick={() => onDecision("DEFER")} disabled={Boolean(record)}>
            <Clock size={13} /> DEFER
          </button>
        </motion.div>
        <AnimatePresence>
          {justRecorded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="pt-chip pt-chip-green"
              style={{ height: 32 }}
            >
              <ShieldCheck size={13} /> DECISION RECORDED
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="pt-muted" style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.08em" }}>
        ANALYTICS PROPOSES · INVESTIGATOR DECIDES
      </div>
    </div>
  );
}

/** Modal wrapper used for the decision flow + integrity chain record. */
export function ModalHost({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      className="pt-modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedOk() ? 0 : 0.18 }}
    >
      <motion.div
        className="pt-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", duration: reducedOk() ? 0 : 0.42, bounce: reducedOk() ? 0 : 0.18 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function DecisionFlowModal({ link, onClose }: { link: PotentialLink; onClose: () => void }) {
  return (
    <ModalHost onClose={onClose}>
      <div className="pt-modal-kicker">ANALYTICAL SIGNAL</div>
      <h3>Potential relationship detected</h3>
      <p className="pt-muted" style={{ margin: "6px 0 16px", fontSize: 12.5 }}>
        Confidence {Math.round(link.confidence * 100)}% · {link.id}
      </p>
      <PotentialLinkPanel link={link} />
      <div className="pt-actions" style={{ marginTop: 16 }}>
        <button className="pt-btn pt-btn-ghost" onClick={onClose}>CLOSE</button>
      </div>
    </ModalHost>
  );
}