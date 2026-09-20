/**
 * PROTOTYPE — Evidence Explorer.
 * Table + inspector workstation. Selecting a row opens the inspector with
 * chain metadata; the integrity modal remains available per record.
 */
import { useMemo, useState } from "react";
import { Search, Fingerprint } from "lucide-react";
import { evidence, formatTimestamp, integritySummary, chainRecords, evidenceById } from "../data";
import { useProtoStore } from "../store";
import { EntityRef, Tag } from "../components";
import { ModalHost } from "./shared";

const KINDS = ["ALL", "FIR", "CDR", "TRANSACTION", "SURVEILLANCE", "LOCATION", "DOCUMENT", "VEHICLE"] as const;

export function Evidence() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("ALL");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selected = selectedId ? evidenceById.get(selectedId) : undefined;
  const modalEvidence = integrityModal ? evidenceById.get(integrityModal) : undefined;

  return (
    <div className="pt-ev-layout">
      <div className="pt-ev-left">
        <div className="pt-band" style={{ padding: "0 0 12px", marginBottom: 12 }}>
          <div>
            <div className="pt-case-id">{rows.length} RECORDS · {integritySummary.evidence_verified} HASH-VERIFIED</div>
            <h1 style={{ fontSize: 22 }}>Evidence Explorer</h1>
          </div>
          <div className="pt-search">
            <Search size={13} style={{ color: "var(--pt-faint)" }} />
            <input placeholder="Search EVID IDs, sources, titles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search evidence" />
          </div>
        </div>

        <div className="pt-ev-filters">
          {KINDS.map((k) => (
            <button key={k} type="button" className={`pt-filter-item ${kind === k ? "on" : ""}`} onClick={() => setKind(k)} style={{ height: 26, padding: "0 10px", fontSize: 10 }}>
              {k === "ALL" ? "ALL TYPES" : k}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, border: "1px solid var(--pt-border)", borderRadius: 12, overflow: "auto" }}>
          <div className="pt-table-scroll">
          <table className="pt-table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>ID</th>
                <th>TYPE</th>
                <th>TITLE</th>
                <th style={{ width: 130 }}>WHEN</th>
                <th>ENTITIES</th>
                <th style={{ width: 150 }}>SOURCE</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="pt-faint" style={{ padding: 24, whiteSpace: "normal" }}>No records match the current filters.</td></tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className={selectedId === e.id ? "sel" : ""} onClick={() => setSelectedId(e.id)} style={{ cursor: "pointer" }}>
                  <td className="pt-mono" style={{ color: "var(--pt-cyan)" }}>{e.id}</td>
                  <td><Tag tone={e.integrity.verified ? "green" : "amber"}>{e.kind}</Tag></td>
                  <td style={{ color: "var(--pt-text)", whiteSpace: "normal", minWidth: 200, lineHeight: 1.35 }}>{e.title}</td>
                  <td className="pt-mono" style={{ color: "var(--pt-faint)" }}>{formatTimestamp(e.timestamp).slice(0, 16)}</td>
                  <td className="pt-mono" style={{ color: "var(--pt-muted)" }}>{e.entities.slice(0, 2).join(", ")}{e.entities.length > 2 ? ` +${e.entities.length - 2}` : ""}</td>
                  <td style={{ color: "var(--pt-faint)" }}>{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="pt-ev-inspector">
        {selected ? (
          <>
            <div className="pt-section-head"><span>Record inspector</span><span className="pt-mono" style={{ fontWeight: 400 }}>{selected.id}</span></div>
            <div className="pt-flex">
              <Tag tone={selected.integrity.verified ? "green" : "amber"}>{selected.kind}</Tag>
              <Tag>SHA-256 · BATCH {selected.integrity.merkle}</Tag>
            </div>
            <h2 className="pt-entity-title" style={{ fontSize: 16 }}>{selected.title}</h2>
            <p className="pt-muted" style={{ fontSize: 12, margin: "2px 0" }}>{selected.source}</p>
            <p className="pt-faint pt-mono" style={{ fontSize: 10.5 }}>{formatTimestamp(selected.timestamp)}</p>

            <div className="pt-hr" />
            <div className="pt-section-head"><span>Related entities</span></div>
            <div className="pt-flex">
              {selected.entities.map((id) => <EntityRef key={id} id={id} />)}
            </div>

            <div className="pt-hr" />
            <div className="pt-section-head"><span>Integrity</span></div>
            <div className="pt-context-row"><span className="k">SHA-256</span><span className="pt-mono v" style={{ color: "var(--pt-cyan)", fontSize: 10.5 }}>{selected.integrity.sha256.slice(0, 20)}…</span></div>
            <div className="pt-context-row"><span className="k">MERKLE BATCH</span><span className="pt-num v">{selected.integrity.merkle}</span></div>
            <div className="pt-context-row"><span className="k">STATUS</span><span className="v" style={{ color: selected.integrity.verified ? "var(--pt-green)" : "var(--pt-amber)" }}>{selected.integrity.verified ? "VERIFIED" : "OPEN"}</span></div>

            <button className="pt-btn" style={{ alignSelf: "flex-start", height: 28, fontSize: 10.5 }} onClick={() => setIntegrityModal(selected.id)}>
              <Fingerprint size={12} /> OPEN CHAIN RECORD
            </button>

            <div className="pt-hr" />
            <div className="pt-section-head"><span>Recent chain reads</span></div>
            {chainRecords.slice(-2).map((c) => (
              <div key={c.id} className="pt-context-row">
                <span className="k">{c.id} · {c.operation}</span>
                <span className="pt-mono v" style={{ color: "var(--pt-faint)", fontSize: 10 }}>{c.current}</span>
              </div>
            ))}
          </>
        ) : (
          <div className="pt-faint" style={{ fontSize: 12, lineHeight: 1.6 }}>
            Select a record to inspect its source, related entities and integrity metadata.
          </div>
        )}
      </div>

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
          <div className="pt-section-head" style={{ textTransform: "none" }}>RELATED ENTITIES</div>
          <div className="pt-flex">
            {modalEvidence.entities.map((id) => <EntityRef key={id} id={id} />)}
          </div>
        </ModalHost>
      )}
    </div>
  );
}