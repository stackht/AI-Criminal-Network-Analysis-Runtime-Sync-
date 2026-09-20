/**
 * PROTOTYPE — SVG force-graph (d3-force). Shared by Network Intelligence and
 * the What-if simulation. Shapes encode entity type, not just color.
 */
import { useEffect, useMemo, useRef } from "react";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3";
import { entities, relationships, communityLabel, type ProtoEntity, type ProtoRel } from "./data";

const W = 920;
const H = 560;

export type NodeDatum = { id: string; x: number; y: number };

function layout(): Map<string, NodeDatum> {
  const nodes = entities.map((e, i) => ({
    id: e.id,
    x: 90 + ((i * 41.7) % (W - 180)),
    y: 80 + ((i * 67.3) % (H - 160)),
  }));
  const idToIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const links = relationships
    .filter((r) => idToIndex.has(r.source) && idToIndex.has(r.target))
    .map((r) => ({ source: r.source, target: r.target }));
  try {
    const sim = forceSimulation<NodeDatum>(nodes)
      .force("link", forceLink<{ id: string; x: number; y: number }, { source: string; target: string }>(links).id((d) => d.id).distance(96).strength(0.3))
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide().radius(34))
      .stop();
    for (let i = 0; i < 360; i += 1) sim.tick();
  } catch {
    /* keep deterministic fallback positions */
  }
  return new Map(nodes.map((n) => [n.id, n]));
}

export function nodeColor(type: string): string {
  switch (type) {
    case "Person": return "var(--pt-cyan)";
    case "Organization": return "var(--pt-violet)";
    case "Account": return "var(--pt-green)";
    case "Vehicle": return "var(--pt-amber)";
    case "Phone": return "var(--pt-rose)";
    case "Location": return "var(--pt-slate)";
    default: return "var(--pt-slate)";
  }
}

export const COMMUNITY_COLORS = ["#56d9ff", "#9b8cff", "#4ade80", "#fbbf24", "#fb7185", "#38bdf8"];

export function communityColor(c: number): string {
  return COMMUNITY_COLORS[(c - 1) % COMMUNITY_COLORS.length];
}

export function neighbors(id: string): Set<string> {
  const set = new Set<string>();
  for (const r of relationships) {
    if (r.source === id) set.add(r.target);
    if (r.target === id) set.add(r.source);
  }
  set.add(id);
  return set;
}

type View = { k: number; tx: number; ty: number };

export function ForceGraph({
  removedIds = new Set<string>(),
  filterTypes,
  selectedId,
  onSelect,
  focusId,
  onFocusChange,
}: {
  removedIds?: Set<string>;
  filterTypes?: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  focusId?: string | null;
  onFocusChange?: (id: string | null) => void;
}) {
  const pos = useMemo(() => layout(), []);
  const svgRef = useRef<SVGSVGElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number } | null>(null);
  const viewRef = useRef<View>({ k: 1, tx: 0, ty: 0 });

  const applyTransform = () => {
    const g = surfaceRef.current?.querySelector("g");
    const v = viewRef.current;
    if (g) g.setAttribute("transform", `translate(${v.tx} ${v.ty}) scale(${v.k})`);
  };

  const fitView = () => {
    const nodes = entities.filter((e) => !removedIds.has(e.id) && (!filterTypes || filterTypes.has(e.type)));
    if (!nodes.length) return;
    const ps = nodes.map((e) => pos.get(e.id)).filter((p): p is NodeDatum => Boolean(p));
    const xs = ps.map((p) => p.x);
    const ys = ps.map((p) => p.y);
    const minX = Math.min(...xs) - 110;
    const maxX = Math.max(...xs) + 110;
    const minY = Math.min(...ys) - 110;
    const maxY = Math.max(...ys) + 110;
    const fit = Math.min(W / (maxX - minX), H / (maxY - minY));
    const k = Math.min(3.2, Math.max(0.3, fit * 1.35));
    viewRef.current = { k, tx: (W - (maxX + minX) * k) / 2, ty: (H - (maxY + minY) * k) / 2 };
    applyTransform();
  };

  useEffect(() => {
    fitView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removedIds, filterTypes]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const block = (e: WheelEvent) => e.preventDefault();
    surface.addEventListener("wheel", block, { passive: false });
    return () => surface.removeEventListener("wheel", block);
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.16 : 0.86;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    const v = viewRef.current;
    const k = Math.min(4.5, Math.max(0.2, v.k * factor));
    viewRef.current = { k, tx: cx - ((cx - v.tx) * k) / v.k, ty: cy - ((cy - v.ty) * k) / v.k };
    applyTransform();
  };
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { px: e.clientX, py: e.clientY };
    if (e.target === svgRef.current) onSelect(null);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    viewRef.current = {
      tx: viewRef.current.tx + ((e.clientX - d.px) * W) / rect.width,
      ty: viewRef.current.ty + ((e.clientY - d.py) * H) / rect.height,
      k: viewRef.current.k,
    };
    dragRef.current = { px: e.clientX, py: e.clientY };
    applyTransform();
  };
  const onPointerUp = () => { dragRef.current = null; };

  const visibleNodes = useMemo(
    () => entities.filter((e) => !removedIds.has(e.id) && (!filterTypes || filterTypes.has(e.type))),
    [removedIds, filterTypes],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((e) => e.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => relationships.filter((r) => visibleIds.has(r.source) && visibleIds.has(r.target)),
    [visibleIds],
  );

  const selNeighbors = selectedId ? neighbors(selectedId) : null;
  const focusSet = focusId ? neighbors(focusId) : null;
  const activeSet = focusSet ?? selNeighbors;
  const active = activeSet !== null;

  return (
    <div ref={surfaceRef} className="pt-net-surface" style={{ height: "100%", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none", cursor: "grab", display: "block" }}
        role="img"
        aria-label="Interactive intelligence network graph"
      >
        <g>
          {visibleEdges.map((r: ProtoRel) => {
            const a = pos.get(r.source);
            const b = pos.get(r.target);
            if (!a || !b) return null;
            const edgeActive = activeSet ? activeSet.has(r.source) && activeSet.has(r.target) : false;
            const dimmed = active && !edgeActive;
            return (
              <line
                key={r.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={edgeActive ? "var(--pt-rose)" : "rgba(120,140,170,0.42)"}
                strokeWidth={edgeActive ? 2 : 1}
                opacity={dimmed ? 0.1 : 0.62}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {visibleNodes.map((e: ProtoEntity) => {
            const p = pos.get(e.id);
            if (!p) return null;
            const isSel = e.id === selectedId;
            const isFocus = e.id === focusId;
            const inActive = activeSet ? activeSet.has(e.id) : true;
            const dimmed = active && !inActive;
            const size = isSel || isFocus ? 20 : 14;
            return (
              <g
                key={e.id}
                transform={`translate(${p.x} ${p.y})`}
                opacity={dimmed ? 0.14 : 1}
                style={{ cursor: "pointer" }}
                onPointerDown={(ev) => { ev.stopPropagation(); onSelect(e.id); onFocusChange?.(e.id); }}
              >
                <NodeShape type={e.type} size={size} selected={isSel} neighbor={inActive && !isSel} dimmed={dimmed} />
                {(isSel || isFocus) && <circle r={size / 2 + 7} fill="none" stroke="var(--pt-cyan)" strokeWidth={1} opacity={0.7} vectorEffect="non-scaling-stroke" />}
                <text
                  y={-size / 2 - 4}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={dimmed ? "var(--pt-faint)" : "var(--pt-text)"}
                  style={{ fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.04em", pointerEvents: "none" }}
                >
                  {e.name.length > 22 ? `${e.name.slice(0, 21)}…` : e.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="pt-net-tools">
        <button className="pt-btn" style={{ height: 28, fontSize: 10 }} onClick={fitView}>FIT VIEW</button>
        <button className="pt-btn pt-btn-ghost" style={{ height: 28, fontSize: 10 }} onClick={() => { onSelect(null); onFocusChange?.(null); }}>RESET FOCUS</button>
      </div>
    </div>
  );
}

export function NodeShape({ type, size, selected, neighbor, dimmed }: { type: string; size: number; selected: boolean; neighbor: boolean; dimmed: boolean }) {
  const shape = nodeShape(type);
  const strokeColor = selected ? "var(--pt-cyan)" : neighbor ? "rgba(155,140,255,0.85)" : "rgba(232,238,247,0.35)";
  const r = size / 2;
  const fill = `color-mix(in srgb, ${nodeColor(type)} 78%, #10141c)`;
  const common = {
    fill,
    stroke: strokeColor,
    strokeWidth: selected ? 2.2 : neighbor ? 1.6 : 1,
    vectorEffect: "non-scaling-stroke" as const,
  };
  switch (shape) {
    case "rect":
      return <rect x={-r} y={-r} width={size} height={size} rx={3} {...common} />;
    case "diamond":
      return <path d={`M0,-${r + 4} L${r + 4},0 L0,${r + 4} L-${r + 4},0 Z`} {...common} />;
    case "triangle":
      return <path d={`M0,-${r + 4} L${r + 5},${r + 3} L-${r + 5},${r + 3} Z`} {...common} />;
    case "ring":
      return (
        <g opacity={dimmed ? 0.5 : 1}>
          <circle r={r + 1} fill="none" stroke={strokeColor} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <circle r={2.6} fill={nodeColor(type)} />
        </g>
      );
    case "pin":
      return (
        <g>
          <path d={`M0,-${r + 6} C ${r + 5},-${r + 1} ${r + 5},${r * 0.4} 0,${r + 4} C -${r + 5},${r * 0.4} -${r + 5},-${r + 1} 0,-${r + 6} Z`} {...common} />
          <circle cx={0} cy={-r * 0.3} r={3} fill="#0d1117" />
        </g>
      );
    default:
      return <circle r={r + 2} {...common} />;
  }
}

function nodeShape(type: string): "circle" | "rect" | "diamond" | "triangle" | "ring" | "pin" {
  switch (type) {
    case "Organization": return "rect";
    case "Account": return "diamond";
    case "Vehicle": return "triangle";
    case "Phone": return "ring";
    case "Location": return "pin";
    default: return "circle";
  }
}

export function communityMembership(c: number): number {
  return entities.filter((e) => e.community === c).length;
}

export function CommunityBars() {
  const counts = Array.from({ length: 6 }, (_, i) => ({ c: i + 1, count: communityMembership(i + 1) }));
  return (
    <div className="pt-stack" style={{ gap: 7 }}>
      {counts.map(({ c, count }) => (
        <div key={c} className="pt-dna-row" style={{ padding: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: communityColor(c) }} />
            <span style={{ color: "var(--pt-muted)", fontSize: 11.5 }}>{communityLabel[c]}</span>
          </span>
          <b className="pt-num">{count}</b>
        </div>
      ))}
    </div>
  );
}