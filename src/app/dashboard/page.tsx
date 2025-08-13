"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OnboardingModal from "@/components/OnboardingModal";
import { Rocket } from "lucide-react";
import SetupGuide from "@/components/SetupGuide";
import CampaignCreator from "@/components/CampaignCreator";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Esta é uma forma mais eficiente de ler o localStorage.
  // A função dentro do useState só é executada na primeira renderização.
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Garante que o localStorage só é acedido no cliente.
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onboardingCompleted') !== 'true';
    }
    return false;
  });

  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  // O useEffect foi simplificado para ter uma responsabilidade mais clara.
  // Ele reage apenas à mudança de status do usuário (loading, user).
  useEffect(() => {
    // Se não está a carregar e não há usuário, redireciona para a página inicial.
    if (!loading && !user) {
      router.push("/");
      return; // Interrompe a execução do efeito
    }

    // Se há um usuário, e ainda não verificamos o setup, fazemos a verificação.
    if (!loading && user && isSetupComplete === null) {
      checkAccountSetup();
    }
  // A remoção de 'isSetupComplete' do array de dependências evita re-execuções desnecessárias.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);


  // Função para marcar o onboarding como completo e fechar o modal.
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  // Função para verificar se o usuário já conectou uma conta de anúncios.
  const checkAccountSetup = async () => {
    if (!user) return;
    setIsCheckingSetup(true); // Inicia a verificação
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/facebook/adaccounts', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      
      // Se a resposta for OK e tivermos pelo menos uma conta, o setup está completo.
      if (res.ok && data.length > 0) {
        setIsSetupComplete(true);
      } else {
        setIsSetupComplete(false);
      }
    } catch (error) {
      console.error("Erro ao verificar setup da conta:", error);
      setIsSetupComplete(false); // Em caso de erro, consideramos o setup incompleto.
    } finally {
      setIsCheckingSetup(false); // Termina a verificação
    }
  };

  // Função dedicada para renderizar o conteúdo principal do painel.
  const renderContent = () => {
    // Mostra o spinner enquanto o estado do usuário ou o setup da conta estão a ser verificados.
    if (isCheckingSetup) {
      return (
        <div className="text-center p-10 text-white">
          <p className="flex items-center justify-center space-x-2">
            <Rocket className="animate-pulse" />
            <span>Verificando configuração da sua conta Meta...</span>
          </p>
        </div>
      );
    }
    
    // Se o setup não estiver completo, mostra o guia de configuração.
    if (isSetupComplete === false) {
      return <SetupGuide onRecheck={checkAccountSetup} isLoading={isCheckingSetup} />;
    }
    
    // Se o setup estiver completo, mostra o criador de campanhas.
    if (isSetupComplete === true) {
      return <CampaignCreator />;
    }

    // Retorno nulo como fallback, caso nenhuma condição seja atendida.
    return null;
  };

  // Renderização principal do componente.
  if (loading || !user) {
    // Ecrã de carregamento principal enquanto a autenticação está a decorrer.
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center space-y-4">
          <Rocket className="animate-pulse text-primary" size={64} />
          <p className="text-xl font-bold text-gray-300">B2Y Marketing</p>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout>
      {/* O modal de onboarding é exibido por cima de tudo se necessário. */}
      {showOnboarding && <OnboardingModal onClose={handleOnboardingComplete} />}
      <div className="w-full max-w-4xl mx-auto py-8">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}