"use client";

import { useAuth } from "@/context/AuthContext"; // Apenas este import de auth é necessário
// O import da função 'logout' de um ficheiro separado já não é necessário
// import { logout } from "@/firebase/auth"; 
import { LayoutDashboard, Megaphone, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // A função 'logout' agora vem diretamente do nosso hook useAuth!
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/campaigns', label: 'Campanhas', icon: <Megaphone size={20} /> },
    { href: '/settings', label: 'Configurações', icon: <Settings size={20} />, disabled: false },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900/70 backdrop-blur-sm p-6 flex flex-col justify-between border-r border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white mb-10">B2Y Marketing</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.label} href={item.disabled ? '#' : item.href} className={`flex items-center space-x-3 p-3 rounded-lg transition ${ isActive ? 'bg-primary text-white font-bold' : item.disabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}>
                  {item.icon}<span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center space-x-3 mb-4">
            {user?.photoURL && (<img src={user.photoURL} alt="Foto do usuário" className="w-10 h-10 rounded-full" />)}
            <div><p className="text-white font-semibold text-sm">{user?.displayName}</p><p className="text-gray-400 text-xs">{user?.email}</p></div>
          </div>
          {/* O botão de logout não muda. Ele simplesmente chama a nova função 'logout' do contexto. */}
          <button onClick={logout} className="w-full flex items-center justify-center space-x-3 text-gray-300 hover:text-white hover:bg-red-600/50 p-2 rounded-md transition"><LogOut size={20} /><span>Sair</span></button>
        </div>
      </aside>
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}