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
  { platform: "Google", account: "trabajo@gmail.com" },
];

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function MockSidebar() {
  const [codes, setCodes] = useState<string[]>(["000000", "000000", "000000", "000000"]);
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

  const timerClass = timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warning" : "";

  return (
    <div className="mock-sidebar">
      <style jsx>{`
        .mock-sidebar {
          width: 320px;
          height: 100%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-header h1 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .icon-btn {
          background: none;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.15s;
        }

        .icon-btn:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .icon-btn svg {
          width: 18px;
          height: 18px;
        }

        .global-timer {
          height: 3px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .global-timer-bar {
          height: 100%;
          background: #5B47ED;
          transition: width 0.1s linear;
          border-radius: 0 2px 2px 0;
        }

        .global-timer.warning .global-timer-bar {
          background: #F59E0B;
        }

        .global-timer.danger .global-timer-bar {
          background: #EF4444;
        }

        .accounts-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
        }

        .account-card {
          background: #FFFFFF;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: border-color 0.08s ease, transform 0.08s ease, box-shadow 0.08s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .account-card:hover {
          border-color: #5B47ED;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(91, 71, 237, 0.15);
        }

        .account-card.copied {
          border-color: #86EFAC;
        }

        .account-info {
          margin-bottom: 10px;
        }

        .account-platform {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .account-name {
          font-size: 13px;
          color: #64748b;
        }

        .code-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .code {
          font-size: 28px;
          font-weight: 700;
          font-family: 'SF Mono', Consolas, monospace;
          color: #5B47ED;
          letter-spacing: 3px;
        }

        .toggle-visibility {
          background: #f8fafc;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-visibility:hover {
          background: #f1f5f9;
          color: #5B47ED;
        }

        .toggle-visibility svg {
          width: 20px;
          height: 20px;
        }

        .copied-feedback {
          position: absolute;
          inset: 0;
          background: #DCFCE7;
          color: #166534;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 11px;
          opacity: 0;
          transform: scale(0.98);
          transition: all 0.12s ease;
          pointer-events: none;
        }

        .account-card.copied .copied-feedback {
          opacity: 1;
          transform: scale(1);
        }

        .copied-feedback svg {
          width: 20px;
          height: 20px;
        }

        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-primary {
          width: 100%;
          background: #5B47ED;
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
        }

        .btn-primary:hover {
          background: #4838D1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(91,71,237,.25);
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 10px;
        }

        .security-badge svg {
          width: 11px;
          height: 11px;
          color: #64748b;
        }

        .security-badge span {
          font-size: 10px;
          color: #64748b;
        }
      `}</style>

      {/* Header */}
      <div className="sidebar-header">
        <h1>Cuentas</h1>
        <button className="icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>

      {/* Timer bar */}
      <div className={`global-timer ${timerClass}`}>
        <div
          className="global-timer-bar"
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      {/* Accounts */}
      <div className="accounts-list">
        {FAKE_ACCOUNTS.map((account, index) => (
          <div
            key={account.platform}
            onClick={() => handleCopy(index)}
            className={`account-card ${copiedIndex === index ? "copied" : ""}`}
          >
            <div className="copied-feedback">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copiado
            </div>
            <div className="account-info">
              <div className="account-platform">{account.platform}</div>
              <div className="account-name">{account.account}</div>
            </div>
            <div className="code-row">
              <span className="code">
                {codes[index]?.slice(0, 3)} {codes[index]?.slice(3)}
              </span>
              <button className="toggle-visibility" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="btn-primary">+ Agregar cuenta</button>
        <div className="security-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Almacenamiento local y cifrado</span>
        </div>
      </div>
    </div>
  );
}
