"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation"; // Importamos o useRouter

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({ 
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Instanciamos o router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // A FUNÇÃO DE LOGOUT CORRIGIDA
  const logout = async () => {
    // Não vamos mais usar setLoading(true) aqui para evitar a tela de carregamento global.
    // O logout deve ser uma ação rápida e direta.
    try {
      await signOut(auth);
      // Após o signOut, forçamos o redirecionamento para a página inicial.
      // Usar window.location.href garante que todo o estado da aplicação será limpo.
      window.location.href = '/'; 
    } catch (error) {
      console.error("Erro ao finalizar a sessão:", error);
      alert("Ocorreu um erro ao tentar sair.");
    }
  };

  const value = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}