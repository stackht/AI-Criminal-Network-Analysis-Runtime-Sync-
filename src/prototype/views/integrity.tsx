/**
 * PROTOTYPE — Integrity & audit ledger.
 */
import { Fingerprint, ShieldCheck, History, AlertTriangle } from "lucide-react";
import { integritySummary, chainRecords, evidence, evidenceById, formatTimestamp } from "../data";
import { useProtoStore } from "../store";
import { Tag, Kicker, EntityRef } from "../components";
import { ModalHost } from "./shared";

function IntegrityRow({ label, value, ok, note }: { label: string; value: string; ok: boolean; note?: string }) {
  return (
    <div className="pt-dna-row">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Fingerprint size={12} style={{ color: ok ? "var(--pt-green)" : "var(--pt-amber)" }} />
        {label}
      </span>
      <b style={{ color: ok ? "var(--pt-green)" : "var(--pt-amber)", fontSize: 11.5 }}>{value}</b>
      {note && <span className="pt-faint" style={{ fontSize: 10 }}>{note}</span>}
    </div>
  );
}

export function Integrity() {
  const decisions = useProtoStore((s) => s.decisions);
  const integrityModal = useProtoStore((s) => s.integrityModal);
  const setIntegrityModal = useProtoStore((s) => s.setIntegrityModal);
  const auditEntries = Object.values(decisions).slice(-3);
  const modalEvidence = integrityModal ? evidenceById.get(integrityModal) : undefined;

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>EVIDENCE INTEGRITY</Kicker>
          <h1 className="pt-title">Integrity ledger</h1>
          <div className="pt-meta">Tamper-evidence chain over synthetic records · clarity that this does not prove truth, only integrity.</div>
        </div>
      </div>

      <div className="pt-integrity-grid">
        <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "18px 20px", background: "rgba(13,17,23,0.82)" }}>
          <div className="pt-hud-kicker"><ShieldCheck size={11} /> INTEGRITY SUMMARY</div>
          <div className="pt-dna-row"><span>CHAIN STATUS</span><b style={{ color: "var(--pt-green)" }}>VALID · {integritySummary.chain_status}</b></div>
          <div className="pt-dna-row"><span>SOURCES REGISTERED</span><b className="pt-num">{integritySummary.evidence_registered}</b></div>
          <div className="pt-dna-row"><span>HASH-VERIFIED</span><b className="pt-num" style={{ color: "var(--pt-green)" }}>{integritySummary.evidence_verified}</b></div>
          <div className="pt-dna-row"><span>OPEN MISMATCHES</span><b className="pt-num" style={{ color: integritySummary.mismatches ? "var(--pt-amber)" : "var(--pt-muted)" }}>{integritySummary.mismatches}</b></div>
          <div className="pt-divider" />
          <IntegrityRow label="SHA-256" value="VERIFIED" ok />
          <IntegrityRow label="MERKLE BATCH" value="VERIFIED" ok />
          <IntegrityRow label="INTEGRITY CHAIN" value="VERIFIED" ok />
          <IntegrityRow label="AUDIT TRAIL" value="ACTIVE" ok />
          <p className="pt-muted" style={{ fontSize: 11, marginTop: 12, lineHeight: 1.65 }}>
            Cryptographic integrity verifies that records are unmodified and that decisions are written to the audit trail. It does not validate the analytic conclusion itself — an analyst decision remains required.
          </p>
        </div>

        <div style={{ border: "1px solid var(--pt-border)", borderRadius: 12, padding: "18px 20px", background: "rgba(13,17,23,0.82)", maxHeight: 420, overflowY: "auto" }}>
          <div className="pt-hud-kicker"><History size={11} /> CHAIN RECORDS</div>
          <div className="pt-chain-table">
            <div className="pt-chain-row">
              <span>ID</span><span>TIMESTAMP</span><span>ACTOR</span><span>OPERATION</span><span>HASH</span>
            </div>
            {chainRecords.map((c) => (
              <div key={c.id} className="pt-chain-row">
                <span>{c.id}</span>
                <span>{formatTimestamp(c.timestamp).slice(0, 16)}</span>
                <span>{c.actor}</span>
                <span style={{ color: "var(--pt-text)" }}>{c.operation}</span>
                <span className="hash">{c.current}</span>
              </div>
            ))}
          </div>
          {auditEntries.length > 0 && (
            <>
              <div className="pt-divider" />
              <div className="pt-hud-kicker"><AlertTriangle size={11} /> ANALYST DECISIONS WRITTEN TO TRAIL</div>
              <div className="pt-stack" style={{ gap: 6 }}>
                {auditEntries.map((d) => (
                  <div key={d.linkId} className="pt-event-item">
                    <span className="pt-mono" style={{ color: "var(--pt-violet)" }}>{d.linkId}</span> · {d.decision} · <span className="pt-faint">{new Date(d.at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 8px" }}>
          <div className="pt-hud-kicker" style={{ marginBottom: 0 }}>REGISTERED EVIDENCE</div>
        </div>
        <div className="pt-table-scroll">
        <table className="pt-table">
          <thead>
            <tr><th>ID</th><th>TYPE</th><th>RECORD</th><th>STATUS</th></tr>
          </thead>
          <tbody>
            {evidence.slice(0, 8).map((e) => (
              <tr key={e.id} role="button" tabIndex={0} style={{ cursor: "pointer" }} onClick={() => setIntegrityModal(e.id)} onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { setIntegrityModal(e.id); ev.preventDefault(); } }}>
                <td className="pt-mono" style={{ color: "var(--pt-cyan)" }}>{e.id}</td>
                <td><Tag tone={e.integrity.verified ? "green" : "amber"}>{e.kind}</Tag></td>
                <td style={{ color: "var(--pt-text)" }}>{e.title}</td>
                <td style={{ color: e.integrity.verified ? "var(--pt-green)" : "var(--pt-amber)" }}>{e.integrity.verified ? "VERIFIED" : "OPEN"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {modalEvidence && (
        <ModalHost onClose={() => setIntegrityModal(null)}>
          <div className="pt-modal-kicker">CHAIN RECORD</div>
          <h3>{modalEvidence.id} · {modalEvidence.kind}</h3>
          <p className="pt-muted" style={{ margin: "6px 0 14px", fontSize: 12.5 }}>{modalEvidence.title}</p>
          <div className="pt-modal-row"><span>SOURCE</span><b>{modalEvidence.source}</b></div>
          <div className="pt-modal-row"><span>TIMESTAMP</span><b>{formatTimestamp(modalEvidence.timestamp)}</b></div>
          <div className="pt-modal-row"><span>SHA-256</span><b className="hash" style={{ color: "var(--pt-cyan)" }}>{modalEvidence.integrity.sha256.slice(0, 26)}…</b></div>
          <div className="pt-modal-row"><span>MERKLE BATCH</span><b>{modalEvidence.integrity.merkle}</b></div>
          <div className="pt-modal-row"><span>RELATED ENTITIES</span></div>
          <div className="pt-flex" style={{ marginTop: 4 }}>
            {modalEvidence.entities.map((id) => <EntityRef key={id} id={id} />)}
          </div>
        </ModalHost>
      )}
    </div>
  );
}