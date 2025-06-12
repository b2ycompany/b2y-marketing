"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Rocket, Layers, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusToggle from "@/components/StatusToggle"; // Importa nosso novo componente

// Tipos
type Ad = { id: string; name: string; effective_status: string; creative?: { body?: string; image_url?: string }};
type AdSet = { id: string; name: string; effective_status: string; ads?: { data: Ad[] }};
type CampaignDetails = { id: string; name: string; objective: string; effective_status: string; adsets?: { data: AdSet[] }};

export default function CampaignDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && campaignId) {
      fetchCampaignDetails();
    }
  }, [user, campaignId]);

  const fetchCampaignDetails = async () => {
      // ...código da função...
  };

  if (loading || isLoading) {
    return <main className="flex min-h-screen items-center justify-center"><Rocket className="animate-pulse" size={40}/></main>;
  }
  
  if (error) {
    return <main className="flex min-h-screen items-center justify-center text-red-400">{error}</main>;
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="mb-8">
            <Link href="/campaigns" className="flex items-center text-sm text-gray-400 hover:text-white mb-4">
                <ArrowLeft size={16} className="mr-2"/>
                Voltar para todas as campanhas
            </Link>
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-white">{campaignDetails?.name}</h1>
                {/* AQUI ESTÁ O TOGGLE DA CAMPANHA */}
                {campaignDetails && <StatusToggle objectId={campaignDetails.id} initialStatus={campaignDetails.effective_status} />}
            </div>
            <p className="text-gray-400">Objetivo: {campaignDetails?.objective}</p>
        </div>

        <div className="space-y-6">
            {campaignDetails?.adsets?.data && campaignDetails.adsets.data.length > 0 ? (
                campaignDetails.adsets.data.map(adSet => (
                    <div key={adSet.id} className="bg-dark-card border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center space-x-3">
                            <Layers className="text-primary"/>
                            <h2 className="text-xl font-semibold text-white">{adSet.name}</h2>
                            {/* AQUI ESTÁ O TOGGLE DO CONJUNTO DE ANÚNCIOS */}
                            <StatusToggle objectId={adSet.id} initialStatus={adSet.effective_status} />
                        </div>
                        <div className="pl-10 mt-4 space-y-4">
                            {adSet.ads?.data && adSet.ads.data.length > 0 ? (
                                adSet.ads.data.map(ad => (
                                    <div key={ad.id} className="flex items-start space-x-4 bg-gray-900/50 p-4 rounded-lg">
                                        <div className="w-24 h-24 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                                            {ad.creative?.image_url ? (<img src={ad.creative.image_url} alt="Criativo" className="w-full h-full object-cover rounded-md"/>) : (<ImageIcon className="text-gray-500"/>)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-white">{ad.name}</p>
                                            <p className="text-sm text-gray-400 truncate">{ad.creative?.body}</p>
                                        </div>
                                        {/* AQUI ESTÁ O TOGGLE DO ANÚNCIO */}
                                        <StatusToggle objectId={ad.id} initialStatus={ad.effective_status} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Nenhum anúncio encontrado neste conjunto.</p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>Nenhum conjunto de anúncios encontrado para esta campanha.</p>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}