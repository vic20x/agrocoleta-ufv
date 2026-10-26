"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, setCurrentUser } from "@/lib/data-store";
import { AuthUser } from "@/types/producer";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener("agro_auth_change", handleAuth);
    return () => window.removeEventListener("agro_auth_change", handleAuth);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" />
          <span>Sistema de Coleta e Gestão Rural</span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-medium text-slate-900 block">{user.name}</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {user.role === "PROFESSOR" ? "Acesso Docente / Pesquisa" : user.propertyName || "Produtor Rural"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                Sair
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-xs font-mono">Acesso Restrito</span>
          )}
        </div>
      </div>
    </header>
  );
}
