import React from "react";
import "./appshell.css";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand">Mi App Médica</div>
      </header>
      <main className="app-shell__main container">{children}</main>
    </div>
  );
}
