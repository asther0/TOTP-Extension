"use client";

import { MockSidebar } from "./MockSidebar";
import { Win2kClock } from "./Win2kClock";

interface HeroProps {
  stars: number | null;
}

export function Hero({ stars }: HeroProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#008080",
        fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
      }}
    >
      {/* Desktop area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Main Window */}
        <div
          className="win-window"
          style={{ width: "420px", minWidth: "300px" }}
        >
          {/* Title Bar */}
          <div className="win-title-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Lock icon */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                <rect x="3" y="7" width="10" height="8" rx="1" fill="white" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" fill="none" />
                <rect x="6.5" y="9" width="3" height="2" fill="#0a246a" />
              </svg>
              <span>TOTP Extension - Autenticador 2FA</span>
            </div>
            <div className="win-title-buttons">
              <div className="win-title-btn">_</div>
              <div className="win-title-btn">□</div>
              <div className="win-title-btn" style={{ fontWeight: "bold" }}>✕</div>
            </div>
          </div>

          {/* Menu bar */}
          <div
            style={{
              background: "#d4d0c8",
              borderBottom: "1px solid #808080",
              padding: "2px 4px",
              display: "flex",
              gap: "2px",
              fontSize: "11px",
            }}
          >
            {["Archivo", "Ver", "Herramientas", "Ayuda"].map((m) => (
              <span
                key={m}
                style={{ padding: "1px 6px", cursor: "default" }}
                className="menu-item"
              >
                {m}
              </span>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "12px", background: "#d4d0c8" }}>
            {/* Headline section */}
            <div
              className="win-inset"
              style={{ padding: "10px 12px", marginBottom: "10px", background: "#ffffff" }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#0a246a",
                  margin: "0 0 4px 0",
                  fontFamily: "'Tahoma', Arial, sans-serif",
                }}
              >
                2FA sin sacar el celular
              </p>
              <p style={{ fontSize: "11px", color: "#444", margin: 0 }}>
                Un espejo de tu authenticator, directo en el navegador.
              </p>
            </div>

            {/* Problem → Solution */}
            <div style={{ marginBottom: "10px" }}>
              <p
                style={{
                  fontSize: "11px",
                  color: "#808080",
                  textDecoration: "line-through",
                  margin: "0 0 4px 0",
                }}
              >
                Buscar celular, desbloquear, abrir app, encontrar cuenta, copiar codigo
              </p>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: 0,
                }}
              >
                Click en la extension. Click en autocompletar.
              </p>
            </div>

            {/* How it works - Group Box */}
            <fieldset
              style={{
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                padding: "8px 10px",
                marginBottom: "10px",
                background: "#d4d0c8",
              }}
            >
              <legend
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "0 4px",
                  color: "#000",
                }}
              >
                Como funciona
              </legend>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  "Al habilitar 2FA, registra la clave en tu app movil y en la extension antes de activar.",
                  "Misma clave = mismos codigos. Celular o navegador, tu decides.",
                  "Exporta e importa entre navegadores. Tus datos nunca salen de tu maquina.",
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        background: "#0a246a",
                        color: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        flexShrink: 0,
                        fontWeight: "bold",
                        border: "1px solid #000",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "11px", color: "#222", lineHeight: "1.4" }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Availability notice */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginBottom: "12px",
                fontSize: "11px",
                color: "#444",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="#0a246a">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 3h1v5H7V7h1z" />
              </svg>
              Disponible para Windows y macOS
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                className="win-button"
                disabled
                style={{ cursor: "not-allowed", color: "#808080" }}
              >
                En revision...
              </button>

              <a
                href="https://github.com/asther0/TOTP-Extension"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button className="win-button" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                  {stars !== null && (
                    <span style={{ fontSize: "10px", color: "#808080" }}>
                      ★ {stars}
                    </span>
                  )}
                </button>
              </a>
            </div>
          </div>

          {/* Status bar */}
          <div className="win-statusbar">
            <div className="win-panel">
              <span>Listo</span>
            </div>
            <div className="win-panel" style={{ marginLeft: "auto" }}>
              <span>Almacenamiento local y cifrado</span>
            </div>
          </div>
        </div>

        {/* Right: Preview Window */}
        <div>
          <div
            className="win-window"
            style={{ width: "300px" }}
          >
            {/* Title Bar */}
            <div className="win-title-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
                  <rect x="3" y="7" width="10" height="8" rx="1" fill="white" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
                <span>Vista Previa - Extension</span>
              </div>
              <div className="win-title-buttons">
                <div className="win-title-btn">_</div>
                <div className="win-title-btn">□</div>
                <div className="win-title-btn" style={{ fontWeight: "bold" }}>✕</div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "8px", background: "#d4d0c8" }}>
              <MockSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="win-taskbar">
        {/* Start Button */}
        <button className="win-start-btn">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <rect x="0" y="0" width="7" height="7" fill="#FF0000" />
            <rect x="9" y="0" width="7" height="7" fill="#00FF00" />
            <rect x="0" y="9" width="7" height="7" fill="#0000FF" />
            <rect x="9" y="9" width="7" height="7" fill="#FFFF00" />
          </svg>
          Inicio
        </button>

        {/* Separator */}
        <div style={{ width: "1px", height: "20px", background: "#808080", borderRight: "1px solid #fff" }} />

        {/* Active window */}
        <button
          className="win-button"
          style={{
            minWidth: "120px",
            textAlign: "left",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#0a246a">
            <rect x="3" y="7" width="10" height="8" rx="1" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#0a246a" strokeWidth="1.5" fill="none" />
          </svg>
          TOTP Extension
        </button>

        {/* System tray */}
        <div className="win-taskbar-clock">
          <Win2kClock />
        </div>
      </div>
    </div>
  );
}
