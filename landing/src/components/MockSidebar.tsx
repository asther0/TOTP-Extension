"use client";

import { useState, useEffect } from "react";

interface Account {
  platform: string;
  email: string;
  color: string;
}

const FAKE_ACCOUNTS: Account[] = [
  { platform: "AWS", email: "admin@empresa.com", color: "#FF9900" },
  { platform: "Vercel", email: "deploy@proyecto.dev", color: "#000000" },
  { platform: "GitHub", email: "dev@github.com", color: "#24292e" },
  { platform: "Google", email: "trabajo@gmail.com", color: "#4285F4" },
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

  return (
    <div className="w-[320px] shrink-0 rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-semibold text-white">Cuentas</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-[3px] bg-white/10">
        <div
          className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-500" : "bg-[#5B47ED]"}`}
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      {/* Accounts */}
      <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
        {FAKE_ACCOUNTS.map((account, index) => (
          <div
            key={account.platform}
            onClick={() => handleCopy(index)}
            className={`relative cursor-pointer rounded-xl border p-3 transition-all ${
              copiedIndex === index
                ? "border-green-500/50 bg-green-500/10"
                : "border-white/10 bg-white/5 hover:border-[#5B47ED]/50 hover:bg-white/[0.07]"
            }`}
          >
            {/* Copied overlay */}
            {copiedIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-semibold">Copiado</span>
              </div>
            )}

            <div className={copiedIndex === index ? "opacity-0" : ""}>
              {/* Account info */}
              <div className="mb-2">
                <div className="text-sm font-semibold text-white">{account.platform}</div>
                <div className="text-xs text-gray-500">{account.email}</div>
              </div>

              {/* Code */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold tracking-wider text-[#5B47ED]">
                  {codes[index]?.slice(0, 3)} {codes[index]?.slice(3)}
                </span>
                <button className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20">
                  Copiar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <button className="w-full rounded-xl bg-[#5B47ED] py-2.5 text-sm font-semibold text-white hover:bg-[#4838D1]">
          + Agregar cuenta
        </button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Almacenamiento local y cifrado
        </div>
      </div>
    </div>
  );
}
