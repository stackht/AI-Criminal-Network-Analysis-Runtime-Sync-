/**
 * PROTOTYPE — shared primitives: counters, sparklines, tags, entity glyphs.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { relationshipById, entityById, caseTitle, caseKey } from "./data";
import { MapPin, Landmark, Car, Smartphone, Users, Building2 } from "lucide-react";
import { useProtoStore } from "./store";

function getShell() {
  return useProtoStore.getState();
}

export function usePrefersReducedMotion(): boolean {
  return useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  ).current;
}

/** Animated number counter that lands exactly on `value`. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);
  return <>{display.toLocaleString("en-US")}</>;
}

export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (!points.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 96;
  const h = 26;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * w},${h - 2 - ((p - min) / span) * (h - 6)}`)
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg className={`pt-spark ${className ?? ""}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} className="pt-spark-fill" />
      <path d={path} className="pt-spark-line" />
    </svg>
  );
}

export const TYPE_COLOR: Record<string, string> = {
  Person: "var(--pt-cyan)",
  Organization: "var(--pt-violet)",
  Vehicle: "var(--pt-amber)",
  Phone: "var(--pt-rose)",
  Location: "var(--pt-slate)",
  Account: "var(--pt-green)",
};

export const TYPE_ICON: Record<string, ReactNode> = {
  Person: <Users size={12} />,
  Organization: <Building2 size={12} />,
  Vehicle: <Car size={12} />,
  Phone: <Smartphone size={12} />,
  Location: <MapPin size={12} />,
  Account: <Landmark size={12} />,
};

export function EntityGlyph({ type, size = 10 }: { type: string; size?: number }) {
  return (
    <span
      className="pt-glyph"
      style={{
        width: size + 8,
        height: size + 8,
        background: `color-mix(in srgb, ${TYPE_COLOR[type] ?? "var(--pt-slate)"} 22%, transparent)`,
        borderColor: TYPE_COLOR[type] ?? "var(--pt-border)",
        color: TYPE_COLOR[type] ?? "var(--pt-muted)",
      }}
      aria-hidden="true"
    >
      {TYPE_ICON[type]}
    </span>
  );
}

export function Tag({ children, tone = "default", style }: { children: ReactNode; tone?: "default" | "cyan" | "violet" | "green" | "amber" | "rose"; style?: React.CSSProperties }) {
  return <span className={`pt-tag pt-tag-${tone}`} style={style}>{children}</span>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="pt-kicker">{children}</div>;
}

export function Panel({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`pt-panel ${className ?? ""}`} style={style}>{children}</section>;
}

export function EntityName({ id }: { id: string }) {
  const entity = entityById.get(id);
  return (
    <span className="pt-entity-link" onClick={() => getShell().openEntity(id)}>
      {entity?.name ?? id}
    </span>
  );
}

export function RelationshipLine({ id }: { id: string }) {
  const rel = relationshipById.get(id);
  if (!rel) return null;
  const a = entityById.get(rel.source);
  const b = entityById.get(rel.target);
  return (
    <div className="pt-relationship-line">
      <EntityRef id={rel.source} />
      <span className="pt-rel-type">{rel.type.replace(/_/g, " ")}</span>
      <EntityRef id={rel.target} />
      <span className="pt-conf">{Math.round(rel.confidence * 100)}%</span>
    </div>
  );
}

export function EntityRef({ id }: { id: string }) {
  const entity = entityById.get(id);
  if (!entity) return <span className="pt-muted">{id}</span>;
  return (
    <button type="button" className="pt-entityref" onClick={() => getShell().openEntity(id)}>
      <EntityGlyph type={entity.type} />
      <span>{entity.name}</span>
    </button>
  );
}

/** Case chip rendered in the persistent shell header. */
export function CaseChip() {
  return (
    <div className="pt-casechip">
      <span className="pt-mono">{caseKey}</span>
      <span className="pt-casechip-title">{caseTitle}</span>
    </div>
  );
}