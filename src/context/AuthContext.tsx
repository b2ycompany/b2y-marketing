"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

// Definindo o tipo para as conexões
type ConnectionsStatus = {
  meta: boolean;
  google: boolean;
};

// Atualizamos o tipo do contexto para incluir as conexões e uma função para recarregá-las
type AuthContextType = {
  user: User | null;
  loading: boolean;
  connections: ConnectionsStatus;
  recheckConnections: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({ 
  user: null,
  loading: true,
  connections: { meta: false, google: false },
  recheckConnections: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionsStatus>({ meta: false, google: false });

  // Função para buscar o estado real das conexões
  const checkConnections = async (currentUser: User | null) => {
    if (!currentUser) {
      setConnections({ meta: false, google: false });
      return;
    }
    try {
      const idToken = await currentUser.getIdToken(true);
      const response = await fetch('/api/user/connections', {
          headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setConnections({
          meta: !!data.connections?.meta,
          google: !!data.connections?.google,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar conexões no contexto:", error);
      setConnections({ meta: false, google: false });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkConnections(currentUser); // Verifica as conexões ao carregar ou mudar de usuário
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; 
    } catch (error) {
      console.error("Erro ao finalizar a sessão:", error);
    }
  };

  const value = { 
    user, 
    loading, 
    connections,
    recheckConnections: () => checkConnections(user), // Expõe a função para recarregar
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}