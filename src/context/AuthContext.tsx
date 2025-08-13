"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// Importamos 'signOut' do firebase/auth
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

// 1. ATUALIZAMOS O TIPO DO CONTEXTO
// Adicionamos a função 'logout', que é uma promessa que não retorna nada (void).
type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>; // <-- Nova adição
};

// 2. ATUALIZAMOS O VALOR INICIAL DO CONTEXTO
// Adicionamos uma função vazia para 'logout' como valor inicial.
export const AuthContext = createContext<AuthContextType>({ 
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta função é o ouvinte principal do Firebase.
    // Ela é chamada sempre que o estado de autenticação muda (login, logout).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // <-- Importante: isto desativa o loading após login/logout
    });
    // Limpa o ouvinte quando o componente é desmontado para evitar fugas de memória.
    return () => unsubscribe();
  }, []);

  // 3. A NOVA FUNÇÃO DE LOGOUT
  // Esta função agora vive dentro do provedor, onde tem acesso a 'setLoading'.
  const logout = async () => {
    setLoading(true); // Inicia o estado de 'loading' para a aplicação
    try {
      // Tenta finalizar a sessão no Firebase.
      await signOut(auth);
      // Se tiver sucesso, o 'onAuthStateChanged' acima será acionado automaticamente,
      // definindo o usuário como nulo e o loading como falso.
    } catch (error) {
      console.error("Erro ao finalizar a sessão:", error);
      alert("Ocorreu um erro ao tentar sair.");
      // Se ocorrer um erro, garantimos que o 'loading' é desativado.
      setLoading(false);
    }
  };

  // 4. ATUALIZAMOS O VALOR FORNECIDO PELO CONTEXTO
  // Agora, o 'logout' está disponível para todos os componentes que usam 'useAuth'.
  const value = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// O hook 'useAuth' permanece o mesmo
export function useAuth() {
  return useContext(AuthContext);
}