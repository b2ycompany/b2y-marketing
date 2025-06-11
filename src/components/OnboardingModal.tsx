"use client";
import { useState } from 'react';
import { Rocket, Target, MousePointerClick, X } from 'lucide-react';

type OnboardingModalProps = { onClose: () => void; };
const steps = [
  { icon: <Rocket size={40} className="text-indigo-400" />, title: 'Bem-vindo à B2Y Marketing!', description: 'Esta é sua central de comando para criar e gerenciar campanhas de marketing de forma simples e poderosa.' },
  { icon: <Target size={40} className="text-green-400" />, title: 'Passo 1: A Campanha', description: 'Tudo começa com uma campanha. Aqui você define seu objetivo principal, como gerar tráfego ou engajamento.' },
  { icon: <MousePointerClick size={40} className="text-rose-400" />, title: 'Passo 2 e 3: O Anúncio', description: 'Em seguida, você definirá o público, orçamento e o criativo (imagem e texto). Nós te guiaremos em cada etapa.'},
  { icon: <Rocket size={40} className="text-indigo-400" />, title: 'Tudo Pronto para Começar!', description: 'Conecte suas contas, siga os passos e veja suas ideias se transformarem em anúncios reais. Vamos decolar!'}
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-card border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md m-4 text-center p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
        <div className="p-4 bg-gray-900/50 rounded-full inline-block mb-6">{steps[currentStep].icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-300 mb-8">{steps[currentStep].description}</p>
        <div className="flex items-center justify-between">
            <div className="flex space-x-2">
                {steps.map((_, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full transition-all ${currentStep === index ? 'bg-primary w-6' : 'bg-gray-600'}`} />
                ))}
            </div>
            <button onClick={handleNext} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition">
                {isLastStep ? 'Concluir' : 'Próximo'}
            </button>
        </div>
      </div>
    </div>
  );
}