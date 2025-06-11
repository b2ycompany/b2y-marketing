"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, LogIn, Mail } from "lucide-react";
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from "@/firebase/auth";
import { UserCredential } from "firebase/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let result: UserCredential | { error: any; } | null;
    if (isLoginView) {
      result = await signInWithEmail(email, password);
    } else {
      result = await signUpWithEmail(email, password);
    }
    if (result && 'error' in result) {
      if (typeof result.error === 'string') {
        if (result.error.includes('auth/invalid-credential') || result.error.includes('auth/invalid-password')) {
          setError('E-mail ou senha inválidos.');
        } else if (result.error.includes('auth/email-already-in-use')) {
          setError('Este e-mail já está em uso. Tente fazer login.');
        } else {
          setError('Ocorreu um erro. Tente novamente.');
        }
      }
    }
  };
  
  if (loading || user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center space-y-4">
          <Rocket className="animate-pulse text-primary" size={64} />
          <p className="text-xl font-bold text-gray-300">B2Y Marketing</p>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-dark-bg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-primary/20 rounded-full mb-4 border border-indigo-500/50">
            <Rocket size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isLoginView ? 'Acesse sua Conta' : 'Crie sua Conta'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isLoginView ? 'Bem-vindo de volta!' : 'Comece sua jornada conosco.'}
          </p>
        </div>
        <div className="p-8 bg-dark-card rounded-xl shadow-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">E-mail</label>
              <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300">Senha</label>
              <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" required minLength={6} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <button type="submit" className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-primary hover:opacity-90 transition">
                <div className="flex items-center justify-center space-x-2">
                  <LogIn size={18}/>
                  <span>{isLoginView ? 'Entrar' : 'Cadastrar'}</span>
                </div>
              </button>
            </div>
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          <button onClick={signInWithGoogle} className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition">
            <div className="flex items-center justify-center space-x-2">
              <Mail size={18}/>
              <span>Entrar com Google</span>
            </div>
          </button>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-sm text-gray-400 hover:text-primary">
            {isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </main>
  );
}