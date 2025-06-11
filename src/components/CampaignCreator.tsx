"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

// Tipos para os nossos dados
type AdAccount = { account_id: string; name: string; };
type FacebookPage = { id: string; name: string; };
type CampaignFormData = { adAccountId: string; campaignName: string; objective: string; };
type AdSetFormData = { adSetName: string; dailyBudget: string; targetingCountry: string; };
type AdFormData = { adName: string; pageId: string; message: string; headline: string; imageUrl: string; link: string; };

export default function CampaignCreator() {
    const { user } = useAuth();

    // Estados de Dados
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);

    // Estados dos Formulários
    const [campaignForm, setCampaignForm] = useState<CampaignFormData>({ adAccountId: '', campaignName: `Campanha de Tráfego ${new Date().toLocaleDateString('pt-BR')}`, objective: 'OUTCOME_TRAFFIC' });
    const [adSetForm, setAdSetForm] = useState<AdSetFormData>({ adSetName: 'Conjunto - Brasil', dailyBudget: '10.00', targetingCountry: 'BR' });
    const [adForm, setAdForm] = useState<AdFormData>({ adName: 'Anúncio Principal', pageId: '', message: 'Clique aqui e saiba mais sobre nossa oferta incrível!', headline: 'Oferta Especial por Tempo Limitado!', imageUrl: 'https://i.imgur.com/3aG4qA0.png', link: 'https://www.google.com' });

    // Estados de Controle de UI
    const [isSubmitting, setIsSubmitting] = useState({ campaign: false, adSet: false, ad: false });
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [createdIds, setCreatedIds] = useState({ campaignId: '', adSetId: '' });

    // Efeito para buscar dados iniciais
    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        if (!user) return;
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
                if (adAccountsData.length > 0) {
                    setCampaignForm(prev => ({ ...prev, adAccountId: adAccountsData[0].account_id }));
                }
            } else {
                setFeedback({ type: 'error', message: `Erro ao buscar contas: ${adAccountsData.error}` });
            }

            const pagesData = await pagesRes.json();
            if (pagesRes.ok) {
                setPages(pagesData);
                if (pagesData.length > 0) {
                    setAdForm(prev => ({ ...prev, pageId: pagesData[0].id }));
                }
            } else {
                setFeedback({ type: 'error', message: `Erro ao buscar páginas: ${pagesData.error}` });
            }
        } catch (error: any) {
            setFeedback({ type: 'error', message: `Erro fatal ao buscar dados: ${error.message}` });
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formSetter: React.Dispatch<React.SetStateAction<any>>) => {
        formSetter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(prev => ({ ...prev, campaign: true }));
        setFeedback(null);
        setCreatedIds({ campaignId: '', adSetId: '' });
        try {
            const idToken = await user.getIdToken(true);
            const res = await fetch('/api/facebook/campaigns/create', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(campaignForm) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setFeedback({ type: 'success', message: `Passo 1 OK! Campanha criada com ID: ${result.campaignId}` });
            setCreatedIds(prev => ({ ...prev, campaignId: result.campaignId }));
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(prev => ({ ...prev, campaign: false }));
        }
    };

    const handleCreateAdSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !createdIds.campaignId) return;
        setIsSubmitting(prev => ({ ...prev, adSet: true }));
        setFeedback(null);
        try {
            const idToken = await user.getIdToken(true);
            const budgetInCents = Math.round(parseFloat(adSetForm.dailyBudget.replace(',', '.')) * 100);
            const payload = { 
                adSetName: adSetForm.adSetName,
                targetingCountry: adSetForm.targetingCountry,
                dailyBudget: budgetInCents,
                adAccountId: campaignForm.adAccountId, 
                campaignId: createdIds.campaignId 
            };
            const res = await fetch('/api/facebook/adsets/create', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setFeedback({ type: 'success', message: `Passo 2 OK! Conjunto de Anúncios criado com ID: ${result.adSetId}` });
            setCreatedIds(prev => ({ ...prev, adSetId: result.adSetId }));
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(prev => ({ ...prev, adSet: false }));
        }
    };
    
    const handleCreateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !createdIds.adSetId) return;
        setIsSubmitting(prev => ({...prev, ad: true}));
        setFeedback(null);
        try {
            const idToken = await user.getIdToken(true);
            const payload = { ...adForm, adAccountId: campaignForm.adAccountId, adSetId: createdIds.adSetId };
            const res = await fetch('/api/facebook/ads/create', { method: 'POST', headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setFeedback({ type: 'success', message: `GRANDE FINAL! Anúncio criado com ID: ${result.adId}. Sua campanha está pronta (e pausada) no Gerenciador!` });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(prev => ({...prev, ad: false}));
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-8">
            <form onSubmit={handleCreateCampaign} className="p-8 bg-dark-card rounded-xl shadow-lg space-y-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white">Passo 1: Criar a Campanha</h2>
                <div>
                    <label htmlFor="adAccountId" className="block text-sm font-medium text-gray-300">Conta de Anúncios</label>
                    <select name="adAccountId" value={campaignForm.adAccountId} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10" required>
                        <option value="" disabled>Carregando contas...</option>
                        {adAccounts.map(account => (<option key={account.account_id} value={account.account_id}>{account.name} ({account.account_id})</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-300">Nome da Campanha</label>
                    <input type="text" name="campaignName" value={campaignForm.campaignName} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                </div>
                <div>
                    <label htmlFor="objective" className="block text-sm font-medium text-gray-300">Objetivo</label>
                    <select name="objective" value={campaignForm.objective} onChange={(e) => handleFormChange(e, setCampaignForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10">
                        <option value="OUTCOME_TRAFFIC">Tráfego</option>
                        <option value="OUTCOME_ENGAGEMENT">Engajamento</option>
                        <option value="OUTCOME_LEADS">Geração de Cadastros</option>
                    </select>
                </div>
                <button type="submit" disabled={isSubmitting.campaign || createdIds.campaignId !== ''} className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-primary hover:opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed transition">
                    {isSubmitting.campaign ? 'Criando...' : 'Criar Campanha e ir para Passo 2'}
                </button>
            </form>

            {createdIds.campaignId && (
                <form onSubmit={handleCreateAdSet} className="p-8 bg-dark-card rounded-xl shadow-lg space-y-6 border border-gray-700 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white">Passo 2: O Conjunto de Anúncios</h2>
                    <p className="text-sm text-gray-400">Para a Campanha ID: {createdIds.campaignId}</p>
                    <div>
                        <label htmlFor="adSetName" className="block text-sm font-medium text-gray-300">Nome do Conjunto</label>
                        <input type="text" name="adSetName" value={adSetForm.adSetName} onChange={(e) => handleFormChange(e, setAdSetForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-300">Orçamento Diário (em R$)</label>
                        <input
                            type="number"
                            name="dailyBudget"
                            value={adSetForm.dailyBudget}
                            onChange={(e) => handleFormChange(e, setAdSetForm)}
                            className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2"
                            placeholder="Ex: 10.50"
                            step="0.01"
                            required
                        />
                        <a 
                          href={campaignForm.adAccountId ? `https://www.facebook.com/ads/manager/account_settings/account_billing?act=${campaignForm.adAccountId}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs text-gray-400 hover:text-primary mt-1 inline-block ${!campaignForm.adAccountId && 'pointer-events-none opacity-50'}`}
                        >
                          Gerenciar forma de pagamento no Facebook ↗
                        </a>
                    </div>
                    <button type="submit" disabled={isSubmitting.adSet || createdIds.adSetId !== ''} className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-green-600 hover:opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed transition">
                        {isSubmitting.adSet ? 'Criando...' : 'Criar Conjunto e ir para Passo 3'}
                    </button>
                </form>
            )}

            {createdIds.adSetId && (
                <form onSubmit={handleCreateAd} className="p-8 bg-dark-card rounded-xl shadow-lg space-y-6 border border-gray-700 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white">Passo 3: O Anúncio Final</h2>
                    <p className="text-sm text-gray-400">Para o Conjunto de Anúncios ID: {createdIds.adSetId}</p>
                    <div>
                        <label htmlFor="adName" className="block text-sm font-medium text-gray-300">Nome do Anúncio</label>
                        <input type="text" name="adName" value={adForm.adName} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="pageId" className="block text-sm font-medium text-gray-300">Página do Facebook/Instagram</label>
                        <select name="pageId" value={adForm.pageId} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10" required>
                            <option value="" disabled>Carregando páginas...</option>
                            {pages.map(page => (<option key={page.id} value={page.id}>{page.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300">Texto Principal do Anúncio</label>
                        <input type="text" name="message" value={adForm.message} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="headline" className="block text-sm font-medium text-gray-300">Título</label>
                        <input type="text" name="headline" value={adForm.headline} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">URL da Imagem (use .png ou .jpg online)</label>
                        <input type="text" name="imageUrl" value={adForm.imageUrl} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-300">Link de Destino</label>
                        <input type="text" name="link" value={adForm.link} onChange={(e) => handleFormChange(e, setAdForm)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required />
                    </div>
                    <button type="submit" disabled={isSubmitting.ad} className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-rose-600 hover:opacity-90 disabled:bg-gray-500 transition">
                        {isSubmitting.ad ? 'Finalizando...' : 'Criar Anúncio e Publicar'}
                    </button>
                </form>
            )}

            {feedback && (
                <div className={`mt-8 p-4 rounded-md animate-fade-in ${feedback.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-red-900/50 text-red-300 border border-red-500'}`}>
                    <p className="font-bold">{feedback.type === 'success' ? 'Sucesso!' : 'Erro:'}</p>
                    <p>{feedback.message}</p>
                </div>
            )}
        </div>
    );
}