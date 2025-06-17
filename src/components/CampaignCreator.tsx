"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Rocket, Layers, Image as ImageIcon, Briefcase, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusToggle from "@/components/StatusToggle";

// Tipos para os dados detalhados
type Ad = { 
    id: string; 
    name: string; 
    effective_status: string; 
    creative?: { 
        body?: string; 
        image_url?: string;
    }
};

type AdSet = { 
    id: string; 
    name: string; 
    effective_status: string; 
    ads?: { 
        data: Ad[] 
    }
};

type CampaignDetails = { 
    id: string; 
    name: string; 
    objective: string; 
    effective_status: string; 
    adsets?: { 
        data: AdSet[] 
    }
};

export default function CampaignDetailPage() {
  const { user, loading: userLoading } = useAuth();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Apenas busca os detalhes se o usuário estiver carregado e tivermos um ID de campanha
    if (user && campaignId) {
      fetchCampaignDetails();
    }
  }, [user, campaignId]);

  const fetchCampaignDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!user) { // Verificação extra de segurança
          throw new Error("Usuário não autenticado.");
        }
        const idToken = await user.getIdToken(true);
        const response = await fetch(`/api/facebook/campaigns/${campaignId}`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Falha ao buscar detalhes da campanha.');
        }
        setCampaignDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string, color: string } } = {
      'ACTIVE': { text: 'Ativa', color: 'text-green-400' },
      'PAUSED': { text: 'Pausada', color: 'text-yellow-400' },
      'ARCHIVED': { text: 'Arquivada', color: 'text-gray-500' },
      'DELETED': { text: 'Deletada', color: 'text-red-400' },
      'IN_PROCESS': { text: 'Em Processamento', color: 'text-blue-400' }
    };
    const details = statusMap[status] || { text: status.replace(/_/g, ' '), color: 'text-gray-400' };
    return <span className={`font-semibold ${details.color}`}>{details.text}</span>;
  };

  if (userLoading || isLoading) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-dark-bg">
            <div className="flex flex-col items-center space-y-4">
                <Rocket className="animate-pulse text-primary" size={64} />
                <p className="text-xl font-bold text-gray-300">Carregando Detalhes...</p>
            </div>
        </main>
    );
  }
  
  if (error) {
    return (
        <DashboardLayout>
            <div className="text-red-400">
                <h2 className="font-bold">Ocorreu um erro:</h2>
                <p>{error}</p>
                <Link href="/campaigns" className="text-sm text-primary hover:underline mt-4 inline-block">
                    Voltar para a lista de campanhas
                </Link>
            </div>
        </DashboardLayout>
    );
  }
  
  if (!campaignDetails) {
    return (
        <DashboardLayout>
            <p>Nenhum detalhe de campanha encontrado.</p>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="mb-8">
            <Link href="/campaigns" className="flex items-center text-sm text-gray-400 hover:text-white mb-4">
                <ArrowLeft size={16} className="mr-2"/>
                Voltar para todas as campanhas
            </Link>
            <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-primary/20 rounded-lg"><Briefcase className="text-primary" size={24}/></div>
                <h1 className="text-3xl font-bold text-white">{campaignDetails.name}</h1>
                <StatusToggle objectId={campaignDetails.id} initialStatus={campaignDetails.effective_status} />
            </div>
            <p className="text-gray-400 ml-16">Objetivo da Campanha: <span className="font-semibold text-gray-200">{campaignDetails.objective}</span></p>
        </div>

        <div className="space-y-6">
            {campaignDetails.adsets?.data && campaignDetails.adsets.data.length > 0 ? (
                campaignDetails.adsets.data.map(adSet => (
                    <div key={adSet.id} className="bg-dark-card border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center space-x-3 border-b border-gray-700 pb-4 mb-4">
                            <Layers className="text-indigo-400" size={20}/>
                            <h2 className="text-xl font-semibold text-white">{adSet.name}</h2>
                            <div className="flex-grow"></div>
                            {formatStatus(adSet.effective_status)}
                            <StatusToggle objectId={adSet.id} initialStatus={adSet.effective_status} />
                        </div>
                        <div className="space-y-4">
                            {adSet.ads?.data && adSet.ads.data.length > 0 ? (
                                adSet.ads.data.map(ad => (
                                    <div key={ad.id} className="flex items-start space-x-4 bg-gray-900/50 p-4 rounded-lg">
                                        <div className="w-24 h-24 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                                            {ad.creative?.image_url ? (
                                                <img src={ad.creative.image_url} alt="Criativo do anúncio" className="w-full h-full object-cover rounded-md"/>
                                            ) : (
                                                <ImageIcon className="text-gray-500"/>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-white">{ad.name}</p>
                                            <p className="text-sm text-gray-400 break-all">{ad.creative?.body}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            {formatStatus(ad.effective_status)}
                                            <StatusToggle objectId={ad.id} initialStatus={ad.effective_status} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 pl-4">Nenhum anúncio encontrado neste conjunto.</p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-dark-card border border-gray-700 rounded-xl p-6 text-center">
                    <p className="text-gray-400">Nenhum conjunto de anúncios encontrado para esta campanha.</p>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}