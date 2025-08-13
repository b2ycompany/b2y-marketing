"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

// Definindo o tipo para as conexões
type ConnectionsStatus = {
  meta: boolean;
  google: boolean;
};

// O tipo do contexto permanece o mesmo
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

  // A FUNÇÃO DE VERIFICAÇÃO CENTRALIZADA E MELHORADA
  const checkConnections = async (currentUser: User | null) => {
    if (!currentUser) {
      setConnections({ meta: false, google: false });
      return;
    }
    try {
      const idToken = await currentUser.getIdToken(true);
      
      // Verificação da Meta: A fonte da verdade é a existência de contas de anúncio.
      const metaCheckPromise = fetch('/api/facebook/adaccounts', {
          headers: { 'Authorization': `Bearer ${idToken}` }
      });

      // Verificação do Google: A fonte da verdade é a existência da conexão no DB.
      const googleCheckPromise = fetch('/api/user/connections', {
          headers: { 'Authorization': `Bearer ${idToken}` }
      });

      // Executa ambas as verificações em paralelo para maior eficiência
      const [metaRes, googleRes] = await Promise.all([metaCheckPromise, googleCheckPromise]);

      // Processa o resultado da Meta
      const metaData = await metaRes.json();
      const isMetaConnected = metaRes.ok && Array.isArray(metaData) && metaData.length > 0;

      // Processa o resultado do Google
      const googleData = await googleRes.json();
      const isGoogleConnected = googleRes.ok && !!googleData.connections?.google;

      setConnections({ meta: isMetaConnected, google: isGoogleConnected });

    } catch (error) {
      console.error("Erro ao centralizar a verificação de conexões:", error);
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
    recheckConnections: () => checkConnections(user),
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}