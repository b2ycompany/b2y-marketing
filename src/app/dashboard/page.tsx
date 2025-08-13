"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OnboardingModal from "@/components/OnboardingModal";
import { Rocket } from "lucide-react";
import SetupGuide from "@/components/SetupGuide";
import PlatformSelector from "@/components/PlatformSelector";
import CampaignForm from "@/components/CampaignForm";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onboardingCompleted') !== 'true';
    }
    return false;
  });

  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  // Novos estados para controlar o fluxo de criação de campanha
  const [creationStep, setCreationStep] = useState('platform_selection'); // 'platform_selection' ou 'form_details'
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (!loading && user && isSetupComplete === null) {
      checkAccountSetup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  const checkAccountSetup = async () => {
    if (!user) return;
    setIsCheckingSetup(true);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/facebook/adaccounts', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setIsSetupComplete(true);
      } else {
        setIsSetupComplete(false);
      }
    } catch (error) {
      console.error("Erro ao verificar setup da conta:", error);
      setIsSetupComplete(false);
    } finally {
      setIsCheckingSetup(false);
    }
  };
  
  // Função chamada pelo PlatformSelector para avançar para o próximo passo
  const handlePlatformsSelected = (platforms: string[]) => {
    setSelectedPlatforms(platforms);
    setCreationStep('form_details');
  };

  // Função para voltar do formulário para o seletor de plataformas
  const handleBackToSelector = () => {
    setCreationStep('platform_selection');
    setSelectedPlatforms([]);
  };

  const renderContent = () => {
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
    
    if (isSetupComplete === false) {
      return <SetupGuide onRecheck={checkAccountSetup} isLoading={isCheckingSetup} />;
    }
    
    if (isSetupComplete === true) {
      if (creationStep === 'platform_selection') {
        return <PlatformSelector onContinue={handlePlatformsSelected} />;
      }
      if (creationStep === 'form_details') {
        return <CampaignForm selectedPlatforms={selectedPlatforms} onBack={handleBackToSelector} />;
      }
    }

    return null;
  };

  if (loading || !user) {
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
      {showOnboarding && <OnboardingModal onClose={handleOnboardingComplete} />}
      <div className="w-full max-w-5xl mx-auto py-8">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}