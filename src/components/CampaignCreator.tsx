"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, ArrowRight, Layers, Image as ImageIcon } from "lucide-react";
import AdPreview from "./AdPreview";

// Tipos
type AdAccount = { account_id: string; name: string; };
type FacebookPage = { id: string; name: string; picture?: { data: { url: string } } };
type CampaignFormData = { adAccountId: string; campaignName: string; objective: string; };
type AdSetFormData = { adSetName: string; dailyBudget: string; targetingCountry: string; };
type AdFormData = { adName: string; pageId: string; message: string; headline: string; imageUrl: string; link: string; };

export default function CampaignCreator() {
    const { user } = useAuth();

    // Estados de Dados e Formulários
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [campaignForm, setCampaignForm] = useState<CampaignFormData>({ adAccountId: '', campaignName: `Campanha de Tráfego ${new Date().toLocaleDateString('pt-BR')}`, objective: 'OUTCOME_TRAFFIC' });
    const [adSetForm, setAdSetForm] = useState<AdSetFormData>({ adSetName: 'Conjunto de Anúncios 1', dailyBudget: '20.00', targetingCountry: 'BR' });
    const [adForm, setAdForm] = useState<AdFormData>({ adName: 'Anúncio Principal', pageId: '', message: 'Descubra nossa nova coleção de verão!', headline: '50% OFF - Só esta semana!', imageUrl: 'https://i.picsum.photos/id/1015/1200/628.jpg', link: 'https://b2y-marketing.vercel.app' });

    // Estados de Controle de UI
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [createdIds, setCreatedIds] = useState({ campaignId: '', adSetId: '', adId: '' });

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => { /* ...código da função... */ };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formSetter: React.Dispatch<React.SetStateAction<any>>) => { /* ...código da função... */ };

    const handleNextStep = async () => {
        setIsSubmitting(true);
        setFeedback(null);
        try {
            if (!user) throw new Error("Usuário não autenticado.");
            const idToken = await user.getIdToken(true);
            const headers = { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' };

            if (activeStep === 1) {
                const res = await fetch('/api/facebook/campaigns/create', { method: 'POST', headers, body: JSON.stringify(campaignForm) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                setCreatedIds(prev => ({ ...prev, campaignId: result.campaignId }));
                setActiveStep(2);
            } else if (activeStep === 2) {
                const budgetInCents = Math.round(parseFloat(adSetForm.dailyBudget.replace(',', '.')) * 100);
                const payload = { ...adSetForm, adAccountId: campaignForm.adAccountId, campaignId: createdIds.campaignId, dailyBudget: budgetInCents };
                const res = await fetch('/api/facebook/adsets/create', { method: 'POST', headers, body: JSON.stringify(payload) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                setCreatedIds(prev => ({ ...prev, adSetId: result.adSetId }));
                setActiveStep(3);
            } else if (activeStep === 3) {
                const payload = { ...adForm, adAccountId: campaignForm.adAccountId, adSetId: createdIds.adSetId };
                const res = await fetch('/api/facebook/ads/create', { method: 'POST', headers, body: JSON.stringify(payload) });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);
                setCreatedIds(prev => ({ ...prev, adId: result.adId }));
                setFeedback({ type: 'success', message: `Campanha publicada com sucesso! ID do Anúncio: ${result.adId}` });
                setActiveStep(4);
            }
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepStatusIcon = (step: number) => {
        if (activeStep > step) return <CheckCircle className="text-green-500" />;
        if (activeStep === step) return <ArrowRight className="text-primary" />;
        return <Circle className="text-gray-500" />;
    };

    const selectedPage = pages.find(p => p.id === adForm.pageId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(1)} <span>Passo 1: Detalhes da Campanha</span></h2>
                        {activeStep > 1 && <button onClick={() => setActiveStep(1)} className="text-sm text-primary hover:underline">Editar</button>}
                    </div>
                    {activeStep === 1 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                           {/* Inputs do Formulário da Campanha */}
                        </div>
                    )}
                </div>

                 <div className={`bg-dark-card border border-gray-700 rounded-xl p-6 transition-opacity duration-500 ${activeStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(2)} <span>Passo 2: Público e Orçamento</span></h2>
                        {activeStep > 2 && <button onClick={() => setActiveStep(2)} className="text-sm text-primary hover:underline">Editar</button>}
                    </div>
                     {activeStep === 2 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                            {/* Inputs do Formulário do Conjunto de Anúncios */}
                        </div>
                    )}
                </div>

                 <div className={`bg-dark-card border border-gray-700 rounded-xl p-6 transition-opacity duration-500 ${activeStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(3)} <span>Passo 3: Criativo do Anúncio</span></h2>
                    </div>
                     {activeStep === 3 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                            {/* Inputs do Formulário do Anúncio */}
                        </div>
                    )}
                </div>
                
                <div className="pt-4">
                    <button onClick={handleNextStep} disabled={isSubmitting || activeStep > 3} className="w-full font-bold py-3 px-4 rounded-lg text-white bg-primary hover:opacity-90 disabled:bg-gray-500 transition">
                        {isSubmitting ? 'Processando...' : (activeStep === 3 ? 'Publicar Campanha Completa' : 'Salvar e Continuar')}
                    </button>
                </div>
                
                {/* CORREÇÃO 1: Bloco de feedback completo */}
                {feedback && (
                    <div className={`mt-4 p-4 rounded-md animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-red-900/50 text-red-300 border border-red-500'}`}>
                        <p className="font-bold">{feedback.type === 'success' ? 'Sucesso!' : 'Erro:'}</p>
                        <p>{feedback.message}</p>
                    </div>
                )}
            </div>

            <div>
                <AdPreview 
                    pageName={selectedPage?.name || "Sua Página"}
                    // CORREÇÃO 2: Adicionando um fallback para a imagem de perfil
                    pageImage={selectedPage?.picture?.data?.url || ''}
                    message={adForm.message}
                    headline={adForm.headline}
                    link={adForm.link}
                    imageUrl={adForm.imageUrl}
                />
            </div>
        </div>
    );
}