"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Rocket, RefreshCw } from "lucide-react";

// Tipos para os nossos dados
type AdAccount = { account_id: string; name: string; };
type Campaign = { id: string; name: string; status: string; effective_status: string; objective: string; created_time: string; };

export default function CampaignsPage() {
  const { user, loading } = useAuth();
  
  // Estados da página
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar as contas de anúncio do usuário
  useEffect(() => {
    const fetchAdAccounts = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken(true);
        const response = await fetch('/api/facebook/adaccounts', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setAdAccounts(data);
        // Se houver contas, seleciona a primeira e busca as campanhas dela
        if (data.length > 0) {
          setSelectedAccountId(data[0].account_id);
          fetchCampaigns(data[0].account_id, idToken);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (user) {
      fetchAdAccounts();
    }
  }, [user]);

  // Função para buscar as campanhas da conta selecionada
  const fetchCampaigns = async (accountId: string, token: string) => {
    setIsLoadingCampaigns(true);
    setError(null);
    setCampaigns([]);
    try {
      const response = await fetch(`/api/facebook/campaigns/list?adAccountId=${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleAccountChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    const newAccountId = e.target.value;
    setSelectedAccountId(newAccountId);
    const idToken = await user.getIdToken(true);
    fetchCampaigns(newAccountId, idToken);
  };
  
  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center"><h1>Carregando...</h1></main>;
  }

  // Função para formatar o status para exibição
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string, color: string } } = {
      'ACTIVE': { text: 'Ativa', color: 'bg-green-500' },
      'PAUSED': { text: 'Pausada', color: 'bg-yellow-500' },
      'ARCHIVED': { text: 'Arquivada', color: 'bg-gray-500' },
      'DELETED': { text: 'Deletada', color: 'bg-red-500' },
    };
    const details = statusMap[status] || { text: status, color: 'bg-gray-400' };
    return <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${details.color}`}>{details.text}</span>;
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-white mb-4">Suas Campanhas</h1>
        <p className="text-gray-400 mb-8">Selecione uma conta de anúncios para visualizar as campanhas criadas.</p>
        
        {/* Seletor de Conta de Anúncios */}
        <div className="mb-6 max-w-sm">
          <label htmlFor="adAccountId" className="block text-sm font-medium text-gray-300">Conta de Anúncios</label>
          <select
            id="adAccountId"
            name="adAccountId"
            value={selectedAccountId}
            onChange={handleAccountChange}
            className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md py-2 pl-3 pr-10"
          >
            {adAccounts.length === 0 && <option disabled>Nenhuma conta encontrada</option>}
            {adAccounts.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.name} ({account.account_id})
              </option>
            ))}
          </select>
        </div>

        {/* Tabela de Campanhas */}
        <div className="bg-dark-card border border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome da Campanha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Objetivo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoadingCampaigns ? (
                <tr><td colSpan={4} className="text-center py-10"><Rocket className="animate-pulse mx-auto"/></td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center py-10 text-red-400">{error}</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Nenhuma campanha encontrada para esta conta.</td></tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-900/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatStatus(campaign.effective_status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{campaign.objective}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(campaign.created_time).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}