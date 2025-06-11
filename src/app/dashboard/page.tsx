"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OnboardingModal from "@/components/OnboardingModal";
import { Rocket } from "lucide-react";
import SetupGuide from "@/components/SetupGuide";
import CampaignCreator from "@/components/CampaignCreator"; // Importamos nosso novo componente

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      checkOnboardingStatus();
      if (isSetupComplete === null) { // Apenas verifica o setup se ainda não o fez
        checkAccountSetup();
      }
    } else if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router, isSetupComplete]);

  const checkOnboardingStatus = () => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted !== 'true') {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  const checkAccountSetup = async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/facebook/adaccounts', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      
      if (res.ok && data.length > 0) {
        setIsSetupComplete(true);
      } else {
        setIsSetupComplete(false);
      }
    } catch (error) {
      setIsSetupComplete(false);
    } finally {
      setIsChecking(false);
    }
  };

  const renderContent = () => {
    if (isChecking || isSetupComplete === null) {
      return (
        <div className="text-center p-10">
          <p className="flex items-center justify-center space-x-2">
            <Rocket className="animate-pulse" />
            <span>Verificando configuração da sua conta Meta...</span>
          </p>
        </div>
      );
    }
    
    if (isSetupComplete === false) {
      return <SetupGuide onRecheck={checkAccountSetup} isLoading={isChecking} />;
    }
    
    if (isSetupComplete === true) {
      return <CampaignCreator />;
    }
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
      <div className="w-full max-w-3xl mx-auto py-8">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}