/**
 * PROTOTYPE — Investigation timeline.
 */
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { timeline, evidenceById, formatTimestamp } from "../data";
import { useProtoStore } from "../store";
import { Tag, Kicker, EntityRef } from "../components";

export function Timeline() {
  const openEntity = useProtoStore((s) => s.openEntity);
  const focusCurrent = useProtoStore((s) => s.selectedEntityId);

  return (
    <div className="pt-stack">
      <div className="pt-pagehead">
        <div>
          <Kicker>INVESTIGATION TIMELINE</Kicker>
          <h1 className="pt-title">18–20 AUG 2026</h1>
          <div className="pt-meta">
            <span className="pt-num">{timeline.length}</span> events · click an entity chip to open its dossier
          </div>
        </div>
      </div>

      <div className="pt-tl">
        {timeline.map((t, i) => {
          const ev = t.evidenceId ? evidenceById.get(t.evidenceId) : undefined;
          const involveSelected = focusCurrent && t.entityIds.includes(focusCurrent);
          return (
            <motion.div
              key={t.id}
              className={`pt-tl-item ${involveSelected ? "" : "muted"}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(0.5, i * 0.03), duration: 0.3 }}
            >
              <div className="pt-tl-stamp">{formatTimestamp(t.timestamp)}</div>
              <div className="pt-tl-type">{t.type.replace(/_/g, " ")}</div>
              <div className="pt-tl-desc">{t.description}</div>
              <div className="pt-tl-subs">
                {t.evidenceId && (
                  <Tag tone="green"><Clock3 size={9} /> {t.evidenceId}</Tag>
                )}
                {t.entityIds.map((id) => (
                  <EntityRef key={id} id={id} />
                ))}
                {ev && <Tag tone="cyan">{ev.kind}</Tag>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}