"use client";

import { useAuth } from "@/context/AuthContext";
import { logout } from "@/firebase/auth";
import { LayoutDashboard, Megaphone, LogOut, Settings } from "lucide-react";
import Link from "next/link";

// Definimos o tipo das props, que inclui 'children'.
// 'children' será o conteúdo da página que o layout irá "abraçar".
type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-sm p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-10">B2Y Marketing</h1>
          <nav className="space-y-4">
            <Link href="/dashboard" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-md transition">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-gray-400 cursor-not-allowed p-2 rounded-md">
              <Megaphone size={20} />
              <span>Campanhas</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-gray-400 cursor-not-allowed p-2 rounded-md">
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>
        
        {/* Perfil do Usuário e Botão de Sair */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center space-x-3 mb-4">
            {user?.photoURL && (
              <img src={user.photoURL} alt="Foto do usuário" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-white font-semibold text-sm">{user?.displayName}</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-3 text-gray-300 hover:text-white hover:bg-red-600/50 p-2 rounded-md transition"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}