import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PrototypeApp } from "./prototype";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div className="pt-panel" style={{ margin: 24 }}><h2>CRIA Showcase could not load</h2><div className="pt-muted">Refresh the page after the error is resolved.</div></div>}>
      <PrototypeApp />
    </ErrorBoundary>
  </React.StrictMode>,
);