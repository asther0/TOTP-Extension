"use client";

import { useState, useEffect } from "react";

interface Account {
  platform: string;
  account: string;
}

const FAKE_ACCOUNTS: Account[] = [
  { platform: "AWS", account: "admin@empresa.com" },
  { platform: "Vercel", account: "deploy@proyecto.dev" },
  { platform: "GitHub", account: "dev@github.com" },
];

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function MockSidebar() {
  const [codes, setCodes] = useState<string[]>(["000000", "000000", "000000"]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCodes(FAKE_ACCOUNTS.map(() => generateCode()));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCodes(FAKE_ACCOUNTS.map(() => generateCode()));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleCopy = (index: number) => {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const timerColor =
    timeLeft <= 5 ? "#EF4444" : timeLeft <= 10 ? "#F59E0B" : "#0a246a";
  const timerPercent = (timeLeft / 30) * 100;

  // Win2000 progress blocks
  const totalBlocks = 14;
  const filledBlocks = Math.round((timerPercent / 100) * totalBlocks);

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif",
        fontSize: "11px",
        background: "#d4d0c8",
      }}
    >
      {/* Inner sunken header */}
      <div
        style={{
          background: "#d4d0c8",
          padding: "4px",
          borderBottom: "1px solid #808080",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "11px" }}>Cuentas</span>
        <button
          style={{
            background: "#d4d0c8",
            border: "2px solid",
            borderColor: "#ffffff #404040 #404040 #ffffff",
            width: "20px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "10px",
          }}
          title="Configuracion"
        >
          ⚙
        </button>
      </div>

      {/* Timer progress bar (Win2000 style blocks) */}
      <div style={{ padding: "4px 4px 2px 4px" }}>
        <div
          style={{
            background: "#ffffff",
            border: "2px solid",
            borderColor: "#808080 #ffffff #ffffff #808080",
            height: "14px",
            padding: "1px",
            display: "flex",
            gap: "1px",
            alignItems: "center",
          }}
        >
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "10px",
                background: i < filledBlocks ? timerColor : "transparent",
              }}
            />
          ))}
          <span
            style={{
              position: "absolute",
              fontSize: "9px",
              color: "transparent",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: "9px",
            color: "#444",
            marginTop: "1px",
          }}
        >
          {timeLeft}s
        </div>
      </div>

      {/* Accounts List */}
      <div style={{ padding: "0 4px 4px 4px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {FAKE_ACCOUNTS.map((account, index) => (
          <div
            key={account.platform}
            onClick={() => handleCopy(index)}
            style={{
              background: copiedIndex === index ? "#d4f4d4" : "#ffffff",
              border: "2px solid",
              borderColor:
                copiedIndex === index
                  ? "#008000 #004000 #004000 #008000"
                  : "#808080 #ffffff #ffffff #808080",
              padding: "6px 8px",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {copiedIndex === index && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,128,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#006400",
                  gap: "4px",
                }}
              >
                <span>✓</span>
                <span>Copiado al portapapeles</span>
              </div>
            )}
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold", fontSize: "12px", color: "#000" }}>
                {account.platform}
              </span>
              <br />
              <span style={{ fontSize: "10px", color: "#444" }}>{account.account}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  fontFamily: "Courier New, monospace",
                  color: "#0a246a",
                  letterSpacing: "4px",
                }}
              >
                {codes[index]?.slice(0, 3)} {codes[index]?.slice(3)}
              </span>
              <button
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#d4d0c8",
                  border: "2px solid",
                  borderColor: "#ffffff #404040 #404040 #ffffff",
                  width: "22px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "10px",
                }}
                title="Copiar"
              >
                ⎘
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "4px",
          borderTop: "1px solid #808080",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <button
          style={{
            width: "100%",
            background: "#d4d0c8",
            border: "2px solid",
            borderColor: "#ffffff #404040 #404040 #ffffff",
            padding: "4px 8px",
            fontFamily: "'Tahoma', Arial, sans-serif",
            fontSize: "11px",
            cursor: "pointer",
            textAlign: "center",
            color: "#000",
          }}
        >
          + Agregar cuenta
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            fontSize: "9px",
            color: "#444",
          }}
        >
          <span>🔒</span>
          <span>Almacenamiento local y cifrado</span>
        </div>
      </div>
    </div>
  );
}
