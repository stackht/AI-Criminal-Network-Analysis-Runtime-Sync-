/**
 * PROTOTYPE — Investigation timeline (day-grouped, strong vertical axis).
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { timeline, evidenceById, formatTimestamp } from "../data";
import { useProtoStore } from "../store";
import { Tag, EntityRef } from "../components";

function dayOf(iso: string): string {
  return formatTimestamp(iso).slice(0, 6);
}

export function Timeline() {
  const focusCurrent = useProtoStore((s) => s.selectedEntityId);

  const groups = useMemo(() => {
    const map = new Map<string, typeof timeline>();
    for (const ev of timeline) {
      const d = dayOf(ev.timestamp);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(ev);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="pt-stack-lg">
      <div className="pt-band" style={{ padding: "0 0 12px", marginBottom: 14 }}>
        <div>
          <div className="pt-case-id">{timeline.length} EVENTS · 18–20 AUG 2026</div>
          <h1 style={{ fontSize: 22 }}>Investigation Timeline</h1>
        </div>
      </div>

      <div className="pt-tl">
        {groups.map(([day, events], gi) => (
          <div key={day} className="pt-tl-day">
            <div className="pt-tl-day-label">{day} AUG 2026</div>
            {events.map((t, i) => {
              const ev = t.evidenceId ? evidenceById.get(t.evidenceId) : undefined;
              const involved = focusCurrent && t.entityIds.includes(focusCurrent);
              return (
                <motion.div
                  key={t.id}
                  className="pt-tl-item"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.35, (gi + i) * 0.02), duration: 0.28 }}
                >
                  <div className="pt-tl-stamp">{formatTimestamp(t.timestamp).slice(11, 16)}</div>
                  <div className="pt-tl-main">
                    <div className="pt-tl-type">{t.type.replace(/_/g, " ")}</div>
                    <div className="pt-tl-desc" style={{ color: involved ? "var(--pt-cyan)" : "var(--pt-text)" }}>{t.description}</div>
                    <div className="pt-tl-subs">
                      {t.evidenceId && <Tag tone="green">{t.evidenceId}</Tag>}
                      {ev && <Tag>{ev.kind}</Tag>}
                    </div>
                  </div>
                  <div style={{ alignSelf: "start", paddingTop: 2 }}>
                    {t.entityIds.map((id) => <EntityRef key={id} id={id} />)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}