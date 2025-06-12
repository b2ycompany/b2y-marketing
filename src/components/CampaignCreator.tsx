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
    const [adForm, setAdForm] = useState<AdFormData>({ adName: 'Anúncio Principal', pageId: '', message: 'Descubra nossa nova coleção de verão! Qualidade e estilo que você merece.', headline: '50% OFF - Só esta semana!', imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9e?q=80&w=1200', link: 'https://b2y-marketing.vercel.app' });

    // Estados de Controle de UI
    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [initialDataError, setInitialDataError] = useState<string | null>(null);
    const [createdIds, setCreatedIds] = useState({ campaignId: '', adSetId: '', adId: '' });

    useEffect(() => { if (user) { fetchInitialData(); } }, [user]);

    const fetchInitialData = async () => {
        if (!user) return;
        setInitialDataError(null);
        try {
            const idToken = await user.getIdToken(true);
            const headers = { 'Authorization': `Bearer ${idToken}` };
            const [adAccountsRes, pagesRes] = await Promise.all([
                fetch('/api/facebook/adaccounts', { headers }),
                fetch('/api/facebook/pages', { headers })
            ]);
            const adAccountsData = await adAccountsRes.json();
            if (adAccountsRes.ok) {
                setAdAccounts(adAccountsData);
                if (adAccountsData.length > 0) setCampaignForm(prev => ({ ...prev, adAccountId: adAccountsData[0].account_id }));
            } else { throw new Error(adAccountsData.error || 'Erro ao buscar contas de anúncio.'); }
            const pagesData = await pagesRes.json();
            if (pagesRes.ok) {
                setPages(pagesData);
                if (pagesData.length > 0) setAdForm(prev => ({ ...prev, pageId: pagesData[0].id }));
            } else { throw new Error(pagesData.error || 'Erro ao buscar páginas do Facebook.'); }
        } catch (error: any) { setInitialDataError(error.message); }
    };
    
    // --- INÍCIO DA CORREÇÃO ---
    // Corrigimos a "assinatura" da função para ser mais específica e aceitar <textarea>
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, 
        formSetter: React.Dispatch<React.SetStateAction<any>>
    ) => {
        formSetter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    // --- FIM DA CORREÇÃO ---
    
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                {initialDataError && ( <div className="p-4 rounded-md bg-red-900/50 text-red-300 border border-red-500"><p className="font-bold">Erro ao Carregar Dados da Conta:</p><p>{initialDataError}</p></div> )}
                
                <div className={`bg-dark-card border rounded-xl p-6 ${activeStep === 1 ? 'border-primary' : 'border-gray-700'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(1)} <span>Passo 1: Detalhes da Campanha</span></h2>
                        {activeStep > 1 && <button onClick={() => { setActiveStep(1); setFeedback(null); }} className="text-sm text-primary hover:underline">Editar</button>}
                    </div>
                    {activeStep === 1 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                            <div><label htmlFor="adAccountId" className="block text-sm font-medium text-gray-300">Conta de Anúncios</label><select name="adAccountId" value={campaignForm.adAccountId} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10" required><option value="" disabled>{adAccounts.length > 0 ? "Selecione uma conta..." : "Carregando..."}</option>{adAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.name} ({acc.account_id})</option>)}</select></div>
                            <div><label htmlFor="campaignName" className="block text-sm font-medium text-gray-300">Nome da Campanha</label><input type="text" name="campaignName" value={campaignForm.campaignName} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                            <div><label htmlFor="objective" className="block text-sm font-medium text-gray-300">Objetivo</label><select name="objective" value={campaignForm.objective} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10"><option value="OUTCOME_TRAFFIC">Tráfego</option><option value="OUTCOME_ENGAGEMENT">Engajamento</option><option value="OUTCOME_LEADS">Cadastros</option></select></div>
                        </div>
                    )}
                </div>

                <div className={`bg-dark-card border rounded-xl p-6 transition-opacity duration-500 ${activeStep >= 2 ? 'opacity-100' : 'opacity-50'} ${activeStep === 2 ? 'border-primary' : 'border-gray-700'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(2)} <span>Passo 2: Público e Orçamento</span></h2>
                        {activeStep > 2 && <button onClick={() => { setActiveStep(2); setFeedback(null); }} className="text-sm text-primary hover:underline">Editar</button>}
                    </div>
                     {activeStep === 2 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                            <div><label htmlFor="adSetName" className="block text-sm font-medium text-gray-300">Nome do Conjunto</label><input type="text" name="adSetName" value={adSetForm.adSetName} onChange={(e) => handleFormChange(e, setAdSetForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                            <div><label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-300">Orçamento Diário (em R$)</label><input type="number" name="dailyBudget" value={adSetForm.dailyBudget} onChange={(e) => handleFormChange(e, setAdSetForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" placeholder="Ex: 20.00" step="0.01" required/></div>
                        </div>
                    )}
                </div>

                <div className={`bg-dark-card border border-gray-700 rounded-xl p-6 transition-opacity duration-500 ${activeStep >= 3 ? 'opacity-100' : 'opacity-50'} ${activeStep === 3 ? 'border-primary' : 'border-gray-700'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-3">{getStepStatusIcon(3)} <span>Passo 3: Criativo do Anúncio</span></h2>
                    </div>
                     {activeStep === 3 && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                           <div><label htmlFor="pageId" className="block text-sm font-medium text-gray-300">Página do Facebook/Instagram</label><select name="pageId" value={adForm.pageId} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10" required><option value="" disabled>{pages.length > 0 ? "Selecione uma página..." : "Carregando..."}</option>{pages.map(page => <option key={page.id} value={page.id}>{page.name}</option>)}</select></div>
                           <div><label htmlFor="message" className="block text-sm font-medium text-gray-300">Texto Principal</label><textarea name="message" value={adForm.message} onChange={(e) => handleFormChange(e, setAdForm)} rows={3} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                           <div><label htmlFor="headline" className="block text-sm font-medium text-gray-300">Título</label><input type="text" name="headline" value={adForm.headline} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                           <div><label htmlFor="link" className="block text-sm font-medium text-gray-300">Link de Destino</label><input type="url" name="link" value={adForm.link} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                           <div><label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">URL da Imagem</label><input type="url" name="imageUrl" value={adForm.imageUrl} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required /></div>
                        </div>
                    )}
                </div>
                
                {activeStep <= 3 && (
                    <div className="pt-4">
                        <button onClick={handleNextStep} disabled={isSubmitting || (activeStep === 1 && !campaignForm.adAccountId)} className="w-full font-bold py-3 px-4 rounded-lg text-white bg-primary hover:opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed transition">
                            {isSubmitting ? 'Processando...' : (activeStep === 3 ? 'Publicar Campanha Completa' : 'Salvar e Continuar')}
                        </button>
                    </div>
                )}
                
                {feedback && (
                    <div className={`mt-4 p-4 rounded-md animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-red-900/50 text-red-300 border border-red-500'}`}>
                        <p className="font-bold">{feedback.type === 'success' ? 'Sucesso!' : 'Erro:'}</p>
                        <p>{feedback.message}</p>
                    </div>
                )}
            </div>
            
            <div className="sticky top-10">
                <h3 className="text-lg font-semibold text-white mb-4">Preview do Anúncio</h3>
                <AdPreview pageName={pages.find(p => p.id === adForm.pageId)?.name || "Sua Página"} pageImage={pages.find(p => p.id === adForm.pageId)?.picture?.data?.url || ""} message={adForm.message} headline={adForm.headline} link={adForm.link} imageUrl={adForm.imageUrl}/>
            </div>
        </div>
    );
}