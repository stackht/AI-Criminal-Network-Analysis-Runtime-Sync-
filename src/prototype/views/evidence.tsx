/**
 * PROTOTYPE — Evidence Explorer.
 */
import { useMemo, useState } from "react";
import { Search, Fingerprint, FileSearch } from "lucide-react";
import { evidence, formatTimestamp, integritySummary, chainRecords, evidenceById } from "../data";
import { useProtoStore } from "../store";
import { EntityRef, Tag, Kicker } from "../components";
import { ModalHost } from "./shared";

const KINDS = ["ALL", "FIR", "CDR", "TRANSACTION", "SURVEILLANCE", "LOCATION", "DOCUMENT", "VEHICLE"] as const;

export function Evidence() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("ALL");
  const [q, setQ] = useState("");
  const setIntegrityModal = useProtoStore((s) => s.setIntegrityModal);
  const integrityModal = useProtoStore((s) => s.integrityModal);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return evidence.filter(
      (e) =>
        (kind === "ALL" || e.kind === kind) &&
        (!query || e.id.toLowerCase().includes(query) || e.title.toLowerCase().includes(query) || e.source.toLowerCase().includes(query)),
    );
  }, [kind, q]);

  const modalEvidence = integrityModal ? evidenceById.get(integrityModal) : undefined;

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>EVIDENCE EXPLORER</Kicker>
          <h1 className="pt-title">Evidence Intake</h1>
          <div className="pt-meta">
            <span className="pt-num">{evidence.length}</span> records · <span className="pt-num">{integritySummary.evidence_verified}</span> hash-verified · {integritySummary.mismatches} open discrepancy
          </div>
        </div>
        <div className="pt-search">
          <Search size={13} style={{ color: "var(--pt-faint)" }} />
          <input placeholder="Search EVID IDs, sources, titles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search evidence" />
        </div>
      </div>

      <div className="pt-ev-filters">
        {KINDS.map((k) => (
          <button key={k} type="button" className={`pt-filter-item ${kind === k ? "on" : ""}`} onClick={() => setKind(k)} style={{ height: 28, padding: "0 12px", fontSize: 10.5 }}>
            {k === "ALL" ? "ALL TYPES" : k}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="pt-panel" style={{ padding: 44, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <FileSearch size={22} style={{ color: "var(--pt-faint)" }} />
          <p className="pt-muted">No evidence records match the current filters.</p>
        </div>
      ) : (
        <div className="pt-ev-grid">
          {rows.map((e) => (
            <div
              key={e.id}
              role="button"
              tabIndex={0}
              className="pt-ev-card"
              onClick={() => setIntegrityModal(e.id)}
              onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { setIntegrityModal(e.id); ev.preventDefault(); } }}
              style={{ cursor: "pointer", textAlign: "left", color: "inherit", background: "linear-gradient(180deg, rgba(19,25,34,0.82), rgba(13,17,23,0.94))" }}
            >
              <div className="pt-flex" style={{ justifyContent: "space-between" }}>
                <Tag tone="green">{e.kind}</Tag>
                <span className="pt-mono" style={{ color: "var(--pt-faint)" }}>{e.id}</span>
              </div>
              <div className="pt-ev-title">{e.title}</div>
              <div className="pt-ev-meta">
                <span>{formatTimestamp(e.timestamp)}</span>
                <span>{e.source}</span>
              </div>
              <div className="pt-ev-entities">
                {e.entities.map((id) => <EntityRef key={id} id={id} />)}
              </div>
              <div className="pt-integrity-strip">
                <Fingerprint size={11} />
                {e.integrity.verified ? `SHA-256 · BATCH ${e.integrity.merkle} VERIFIED` : "OPEN — RE-CAPTURE REQUIRED"}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalEvidence && (
        <ModalHost onClose={() => setIntegrityModal(null)}>
          <div className="pt-modal-kicker">CHAIN RECORD</div>
          <h3>{modalEvidence.id} · {modalEvidence.kind}</h3>
          <p className="pt-muted" style={{ margin: "6px 0 14px", fontSize: 12.5 }}>{modalEvidence.title}</p>
          <div className="pt-modal-row"><span>SOURCE</span><b>{modalEvidence.source}</b></div>
          <div className="pt-modal-row"><span>TIMESTAMP</span><b>{formatTimestamp(modalEvidence.timestamp)}</b></div>
          <div className="pt-modal-row"><span>SHA-256</span><b className="hash" style={{ color: "var(--pt-cyan)" }}>{modalEvidence.integrity.sha256.slice(0, 26)}…</b></div>
          <div className="pt-modal-row"><span>MERKLE BATCH</span><b>{modalEvidence.integrity.merkle} · VERIFIED</b></div>
          <div className="pt-modal-row"><span>STATUS</span><b style={{ color: modalEvidence.integrity.verified ? "var(--pt-green)" : "var(--pt-amber)" }}>{modalEvidence.integrity.verified ? "VERIFIED" : "OPEN"}</b></div>
          <div className="pt-divider" />
          <div className="pt-hud-kicker">RELATED ENTITIES</div>
          <div className="pt-flex">
            {modalEvidence.entities.map((id) => <EntityRef key={id} id={id} />)}
          </div>
          <div className="pt-divider" />
          <div className="pt-hud-kicker">RECENT CHAIN READS</div>
          <div className="pt-stack" style={{ gap: 5 }}>
            {chainRecords.slice(-2).map((c) => (
              <div key={c.id} className="pt-mono" style={{ fontSize: 10, color: "var(--pt-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>{c.id} · {c.operation}</span>
                <span className="hash" style={{ color: "var(--pt-cyan)" }}>{c.current}</span>
              </div>
            ))}
          </div>
        </ModalHost>
      )}
    </div>
  );
}