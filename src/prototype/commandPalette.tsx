/**
 * PROTOTYPE — Command palette (Ctrl+K).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, LayoutDashboard, Globe2, Network, Users, Fingerprint, Clock3, FlaskConical, ShieldCheck } from "lucide-react";
import { entities, evidence, entityById } from "./data";
import type { ProtoView } from "./store";
import { useProtoStore } from "./store";
import { EntityGlyph } from "./components";

const VIEWS: { view: ProtoView; label: string; sub: string; icon: React.ReactNode }[] = [
  { view: "command-centre", label: "3D Command Centre", sub: "Geographic intelligence theatre", icon: <Globe2 size={14} /> },
  { view: "network", label: "Network Intelligence", sub: "Relationship mesh & communities", icon: <Network size={14} /> },
  { view: "entities", label: "Entity Registry", sub: "47 registered entities", icon: <Users size={14} /> },
  { view: "evidence", label: "Evidence Explorer", sub: "18 integrity-verified records", icon: <Fingerprint size={14} /> },
  { view: "timeline", label: "Investigation Timeline", sub: "18–20 AUG 2026", icon: <Clock3 size={14} /> },
  { view: "what-if", label: "What-if Simulation", sub: "Network impact sandbox", icon: <FlaskConical size={14} /> },
  { view: "integrity", label: "Integrity Ledger", sub: "Chain records & audit trail", icon: <ShieldCheck size={14} /> },
];

type Entry =
  | { kind: "view"; view: ProtoView; label: string; sub: string; node: React.ReactNode }
  | { kind: "entity"; id: string; label: string; sub: string; node: React.ReactNode }
  | { kind: "evidence"; id: string; label: string; sub: string; node: React.ReactNode };

export function CommandPalette() {
  const open = useProtoStore((s) => s.paletteOpen);
  const setPaletteOpen = useProtoStore((s) => s.setPaletteOpen);
  const setView = useProtoStore((s) => s.setView);
  const openEntity = useProtoStore((s) => s.openEntity);
  const setIntegrityModal = useProtoStore((s) => s.setIntegrityModal);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    const viewEntries: Entry[] = VIEWS.map((v) => ({ kind: "view", view: v.view, label: v.label, sub: v.sub, node: v.icon }));
    const entityEntries: Entry[] = entities
      .filter((e) => !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || typeLabel(e).includes(q))
      .slice(0, 6)
      .map((e) => ({ kind: "entity" as const, id: e.id, label: e.name, sub: `${e.id} · ${typeLabel(e)}`, node: <EntityGlyph type={e.type} /> }));
    const evidenceEntries: Entry[] = evidence
      .filter((e) => !q || e.id.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.kind.toLowerCase().includes(q))
      .slice(0, 4)
      .map((e) => ({ kind: "evidence" as const, id: e.id, label: e.title, sub: `${e.id} · ${e.kind}`, node: <Fingerprint size={13} /> }));
    if (!q) return [...viewEntries, ...entityEntries];
    return [...viewEntries.filter((v) => v.label.toLowerCase().includes(q) || v.sub.toLowerCase().includes(q)), ...entityEntries, ...evidenceEntries];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!open) return null;

  const activate = (entry: Entry) => {
    if (entry.kind === "view") setView(entry.view);
    else if (entry.kind === "entity") openEntity(entry.id);
    else {
      setView("evidence");
      setIntegrityModal(entry.id);
    }
    setPaletteOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { setCursor((c) => Math.min(entries.length - 1, c + 1)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setCursor((c) => Math.max(0, c - 1)); e.preventDefault(); }
    else if (e.key === "Enter" && entries[cursor]) { activate(entries[cursor]); }
    else if (e.key === "Escape") { setPaletteOpen(false); }
  };

  const visible = entries.slice(0, 22);

  return (
    <motion.div
      className="pt-palette-backdrop"
      onClick={() => setPaletteOpen(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      <motion.div
        className="pt-palette"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16 }}
      >
        <div className="pt-palette-query">
          <Search size={16} style={{ color: "var(--pt-cyan)" }} />
          <input
            ref={inputRef}
            placeholder="Search CRIA — entities, evidence, cases, views…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKey}
            aria-label="Command palette search"
          />
        </div>
        <div className="pt-palette-list">
          {visible.length === 0 && <div className="pt-muted" style={{ padding: 14, fontSize: 12.5 }}>No matches.</div>}
          {visible.map((entry, i) => (
            <button
              key={`${entry.kind}-${entry.kind === "view" ? entry.view : entry.id}`}
              type="button"
              className={`pt-palette-item ${cursor === i ? "hl" : ""}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => activate(entry)}
            >
              {entry.node}
              <span>{entry.label}</span>
              <span className="pt-muted" style={{ fontSize: 11 }}>{entry.sub}</span>
              <span className="pt-kind">{entry.kind.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="pt-palette-hint">
          <span>↑↓ NAVIGATE</span><span>↵ OPEN</span><span>ESC CLOSE</span>
          <span style={{ marginLeft: "auto", color: "var(--pt-cyan)" }}>{visible.length} RESULTS</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function typeLabel(e: { type: string }): string {
  return e.type.toUpperCase();
}

export function entityNameById(id: string): string {
  return entityById.get(id)?.name ?? id;
}