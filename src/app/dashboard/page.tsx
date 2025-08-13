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
  const { user, loading, connections, recheckConnections } = useAuth();
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onboardingCompleted') !== 'true';
    }
    return false;
  });

  const [creationStep, setCreationStep] = useState('platform_selection');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  const handlePlatformsSelected = (platforms: string[]) => {
    setSelectedPlatforms(platforms);
    setCreationStep('form_details');
  };

  const handleBackToSelector = () => {
    setCreationStep('platform_selection');
    setSelectedPlatforms([]);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10 text-white"><p className="flex items-center justify-center space-x-2"><Rocket className="animate-pulse" /><span>Verificando configuração da sua conta...</span></p></div>
      );
    }
    
    // A condição para o setup agora é simplesmente 'connections.meta'.
    if (connections.meta === false) {
      // --- INÍCIO DA CORREÇÃO ---
      // Passamos a propriedade 'loading' do nosso AuthContext para a prop 'isLoading' do SetupGuide.
      return <SetupGuide onRecheck={recheckConnections} isLoading={loading} />;
      // --- FIM DA CORREÇÃO ---
    }
    
    if (connections.meta === true) {
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
      <main className="flex min-h-screen items-center justify-center bg-dark-bg"><div className="flex flex-col items-center space-y-4"><Rocket className="animate-pulse text-primary" size={64} /><p className="text-xl font-bold text-gray-300">B2Y Marketing</p></div></main>
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