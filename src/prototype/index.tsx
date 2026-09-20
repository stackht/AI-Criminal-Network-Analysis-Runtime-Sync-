/**
 * PROTOTYPE — guided demo tour (non-intrusive) + cinematic intro + shell.
 */
import { useEffect, useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Globe2, Network as NetworkIcon, Users, Fingerprint, Clock3, FlaskConical, ShieldCheck, X, ChevronRight, ChevronLeft, Search as SearchIcon, Menu as MenuIcon } from "lucide-react";
import "./styles.css";
import { caseTitle, caseKey, PROTOTYPE_LABEL } from "./data";
import { PROTOTYPE_BRAND, BRAND_TITLE } from "./brand";
import { useProtoStore, type ProtoView, focusEntityOnMap } from "./store";
import { Overview } from "./views/overview";
import { CommandCentre } from "./views/commandCentre";
import { Network as NetworkView } from "./views/network";
import { Entities } from "./views/entities";
import { EntityDossier } from "./views/entity";
import { Evidence } from "./views/evidence";
import { Timeline } from "./views/timeline";
import { WhatIf } from "./views/whatif";
import { Integrity } from "./views/integrity";
import { CommandPalette } from "./commandPalette";
import { ErrorBoundary } from "../components/ErrorBoundary";

const NAV: { view: ProtoView; label: string; icon: React.ReactNode }[] = [
  { view: "overview", label: "CASE", icon: <LayoutDashboard size={16} /> },
  { view: "command-centre", label: "THEATRE", icon: <Globe2 size={16} /> },
  { view: "network", label: "NETWORK", icon: <NetworkIcon size={16} /> },
  { view: "entities", label: "ENTITIES", icon: <Users size={16} /> },
  { view: "evidence", label: "EVIDENCE", icon: <Fingerprint size={16} /> },
  { view: "timeline", label: "TIMELINE", icon: <Clock3 size={16} /> },
  { view: "what-if", label: "WHAT-IF", icon: <FlaskConical size={16} /> },
  { view: "integrity", label: "INTEGRITY", icon: <ShieldCheck size={16} /> },
];

const TOUR: { view: ProtoView; title: string; desc: string; action?: () => void; actionLabel?: string }[] = [
  { view: "overview", title: "CASE INTELLIGENCE", desc: "Operation Meridian — a connected investigative corpus: 47 entities, 126 relationships, 18 evidence sources." },
  { view: "command-centre", title: "3D COMMAND CENTRE", desc: "The geographic theatre. Select an entity on the globe or in the index to resolve its network." },
  { view: "command-centre", title: "ANALYST SIGNAL", desc: "A potential relationship was detected (87% confidence). Analytics proposes — the investigator decides." },
  { view: "network", title: "NETWORK INTELLIGENCE", desc: "Structured communities and structural bridges. Shapes encode entity type; color encodes community." },
  { view: "entity", title: "ENTITY DOSSIER", desc: "Arjun Mehta — analytical signals, ego network, evidence and financial footprint in one dossier.", action: () => focusEntityOnMap("ENT-0192") },
  { view: "evidence", title: "EVIDENCE EXPLORER", desc: "Every record carries a SHA-256 + Merkle batch. Click any card to open its chain record." },
  { view: "timeline", title: "INVESTIGATION TIMELINE", desc: "Movement, communications, transaction clusters and analyst review in a single temporal view." },
  { view: "what-if", title: "WHAT-IF SIMULATION", desc: "Remove an entity and the prototype recomputes the real graph: downstream impact and fragmentation." },
  { view: "integrity", title: "INTEGRITY / AUDIT", desc: "Chain records, audit trail and analyst decisions written back. The final step of the SIH story." },
];

export function PrototypeApp() {
  const booted = useProtoStore((s) => s.booted);
  const view = useProtoStore((s) => s.view);
  const boot = useProtoStore((s) => s.boot);
  const setView = useProtoStore((s) => s.setView);
  const setPaletteOpen = useProtoStore((s) => s.setPaletteOpen);
  const demoMode = useProtoStore((s) => s.demoMode);
  const setDemoMode = useProtoStore((s) => s.setDemoMode);
  const tourRunning = useProtoStore((s) => s.tourRunning);
  const setTourRunning = useProtoStore((s) => s.setTourRunning);
  const [clock, setClock] = useState(() => new Date());
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    document.title = BRAND_TITLE;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useProtoStore.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen]);

  useEffect(() => {
    if (booted) return;
    const t = window.setTimeout(() => boot(), 1850);
    return () => window.clearTimeout(t);
  }, [booted, boot]);

  const renderView = () => {
    switch (view) {
      case "overview": return <Overview />;
      case "command-centre": return <CommandCentre />;
      case "network": return <NetworkView />;
      case "entities": return <Entities />;
      case "entity": return <EntityDossier />;
      case "evidence": return <Evidence />;
      case "timeline": return <Timeline />;
      case "what-if": return <WhatIf />;
      case "integrity": return <Integrity />;
    }
  };

  return (
    <div className="pt-root">
      {!booted && <Intro />}
      <div className="pt-shell">
        <header className="pt-header">
          <div className="pt-brand">
            <span className="pt-brand-mark">{PROTOTYPE_BRAND.mark}</span>
            <div>
              <div className="pt-brand-name">{PROTOTYPE_BRAND.name}</div>
              <div className="pt-brand-tag">{PROTOTYPE_BRAND.descriptor.toUpperCase()}</div>
            </div>
          </div>
          <div className="pt-breadcrumb">
            <b>{PROTOTYPE_BRAND.name}</b> · {caseKey} · {caseTitle} · <span className="pt-muted">{view.toUpperCase().replace("-", " ")}</span>
          </div>
          <div className="pt-header-spacer" />
          <div className="pt-header-group">
            <span className="pt-chip pt-chip-green"><span className="live-dot" /> SYSTEM ONLINE</span>
            <span className="pt-chip">{PROTOTYPE_LABEL}</span>
            <span className="pt-clock">{clock.toLocaleTimeString([], { hour12: false })} UTC</span>
            <button
              type="button"
              className={`pt-header-btn ${demoMode ? "on" : ""}`}
              onClick={() => { setDemoMode(!demoMode); if (!demoMode) setTourRunning(true); }}
              title="Toggle demo mode"
            >
              DEMO MODE
            </button>
            <button type="button" className="pt-header-btn" onClick={() => setPaletteOpen(true)} aria-label="Search" title="Search (Ctrl+K)">
              <SearchIcon size={14} />
              <span className="pt-search-label">SEARCH</span>
            </button>
            <button type="button" className="pt-header-btn pt-header-menu" onClick={() => setNavOpen(true)} aria-label="Open navigation" title="Menu">
              <MenuIcon size={16} />
            </button>
          </div>
        </header>

        <nav className="pt-rail" aria-label="Prototype navigation">
          {NAV.map((n) => (
            <button
              key={n.view}
              type="button"
              className={`pt-rail-btn ${view === n.view || (n.view === "entities" && view === "entity") ? "active" : ""}`}
              onClick={() => setView(n.view)}
              title={n.label}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
          <div className="pt-rail-spacer" />
          {demoMode && <button type="button" className="pt-rail-btn pt-rail-demo" onClick={() => setTourRunning(true)}>TOUR</button>}
        </nav>

        <main className="pt-main">
<AnimatePresence mode="wait">
        <motion.div
          key={view}
          className="pt-scale-wrap"
          initial={{ opacity: 0, scale: 0.995, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.997, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          <ErrorBoundary
            key={view}
            fallback={
              <div className="pt-view-content pt-scroll">
                <div className="pt-panel" style={{ padding: 34 }}>
                  <div className="pt-hud-kicker" style={{ color: "var(--pt-rose)" }}>VISUALIZATION UNAVAILABLE</div>
                  <p style={{ color: "var(--pt-muted)", fontSize: 13 }}>This layer failed to load. Re-enter via the rail navigation.</p>
                </div>
              </div>
            }
          >
            <div className="pt-view-content pt-scroll">{renderView()}</div>
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {tourRunning && <TourGuide />}
      </AnimatePresence>
      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="pt-drawer-backdrop"
            onClick={() => setNavOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <motion.aside
              className="pt-drawer"
              aria-label="Navigation"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", duration: 0.34, bounce: 0.15 }}
            >
              <div className="pt-drawer-head">
                <div className="pt-drawer-brand">
                  <span className="pt-brand-mark">{PROTOTYPE_BRAND.mark}</span>
                  <span className="pt-drawer-brand-name">{PROTOTYPE_BRAND.name}</span>
                </div>
                <button type="button" className="pt-header-btn" onClick={() => setNavOpen(false)} aria-label="Close navigation">
                  <X size={15} />
                </button>
              </div>
              {NAV.map((n) => (
                <button
                  key={n.view}
                  type="button"
                  className={`pt-drawer-item ${view === n.view || (n.view === "entities" && view === "entity") ? "active" : ""}`}
                  onClick={() => { setView(n.view); setNavOpen(false); }}
                >
                  {n.icon}
                  <span>{n.label}</span>
                </button>
              ))}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        <CommandPalette />
      </AnimatePresence>
    </div>
  );
}

function Intro() {
  const bars = [10, 16, 12, 22, 14, 26, 18, 30, 16, 24];
  const reduced =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <motion.div
      className="pt-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)", scale: 1.02 }}
      transition={{ duration: reduced ? 0 : 0.4 }}
      aria-label="Initializing CRIA intelligence engine"
    >
      <div className="pt-intro-inner">
        <motion.div
          className="pt-intro-mark"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: "easeOut" }}
        >
          {PROTOTYPE_BRAND.mark}
        </motion.div>
        <motion.div
          className="pt-intro-name"
          initial={{ opacity: 0, y: 8, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.42em" }}
          transition={{ duration: reduced ? 0 : 0.5, delay: 0.08 }}
        >
          {PROTOTYPE_BRAND.name}
        </motion.div>
        <motion.div
          className="pt-intro-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.4, delay: 0.2 }}
        >
          {PROTOTYPE_BRAND.fullName.toUpperCase()}
        </motion.div>
        <motion.div
          className="pt-intro-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.4, delay: 0.3 }}
        >
          {PROTOTYPE_BRAND.descriptor.toUpperCase()}
        </motion.div>
        <motion.div
          className="pt-intro-line"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1] }}
          transition={{ duration: reduced ? 0 : 1.2, delay: 0.35, times: [0, 0.12, 1] }}
        >
          INITIALIZING INTELLIGENCE ENGINE
        </motion.div>
        <div className="pt-intro-bars" aria-hidden="true">
          {bars.map((h, i) =>
            reduced ? (
              <span key={i} className="pt-intro-bar" style={{ height: h, opacity: 0.6 }} />
            ) : (
              <motion.span
                key={i}
                className="pt-intro-bar"
                style={{ height: h }}
                animate={{ opacity: [0.2, 1, 0.2], height: [h * 0.4, h, h * 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
              />
            ),
          )}
        </div>
        <motion.div
          className="pt-intro-line"
          style={{ marginTop: 26, color: "var(--pt-green)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.3, delay: 1.35 }}
        >
          CASE ENVIRONMENT READY
        </motion.div>
      </div>
    </motion.div>
  );
}

function TourGuide() {
  const [step, setStep] = useState(0);
  const setView = useProtoStore((s) => s.setView);
  const setTourRunning = useProtoStore((s) => s.setTourRunning);
  const current = TOUR[Math.min(step, TOUR.length - 1)];

  const go = (next: number) => {
    const idx = Math.max(0, Math.min(TOUR.length - 1, next));
    setStep(idx);
    const target = TOUR[idx];
    setView(target.view);
    target.action?.();
  };

  const exit = () => {
    setTourRunning(false);
    setStep(0);
  };

  return (
    <motion.div
      className="pt-tour"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      role="dialog"
      aria-label="Guided demo"
    >
      <div className="pt-tour-step">
        <span>{TOUR[step].title}</span>
        {step + 1} / {TOUR.length}
      </div>
      <div className="pt-tour-desc">{current.desc} {current.actionLabel ?? ""}</div>
      <div className="pt-tour-dots">
        {TOUR.map((_, i) => <span key={i} className={`pt-tour-dot ${i === step ? "on" : ""}`} />)}
      </div>
      <div className="pt-actions" style={{ gap: 6 }}>
        <button className="pt-btn pt-btn-ghost" style={{ height: 30, fontSize: 10 }} onClick={() => go(step - 1)} disabled={step === 0}>
          <ChevronLeft size={13} />
        </button>
        <button className="pt-btn pt-btn-primary" style={{ height: 30, fontSize: 10 }} onClick={() => (step >= TOUR.length - 1 ? exit() : go(step + 1))}>
          {step >= TOUR.length - 1 ? "FINISH" : "NEXT"} <ChevronRight size={13} />
        </button>
        <button className="pt-btn pt-btn-ghost" style={{ height: 30, fontSize: 10 }} onClick={exit} aria-label="Close tour">
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}