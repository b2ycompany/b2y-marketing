"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { LinkIcon, Rocket } from "lucide-react";
import { FaFacebook, FaGoogle, FaLinkedin } from "react-icons/fa";

type ConnectionsStatus = {
  meta: boolean;
  google: boolean;
};

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [connections, setConnections] = useState<ConnectionsStatus>({ meta: false, google: false });
    const [isLoadingConnections, setIsLoadingConnections] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // A função de verificação é chamada apenas se o usuário estiver autenticado.
        if (user) {
            checkAllConnections();
        }
    // A dependência 'user' garante que esta verificação ocorra assim que o usuário estiver disponível.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Função assíncrona para verificar o status de todas as conexões de uma só vez.
    const checkAllConnections = async () => {
        if (!user) return;
        setIsLoadingConnections(true);
        try {
            const idToken = await user.getIdToken(true);
            
            // Prepara as duas chamadas de API para serem executadas em paralelo.
            const metaCheckPromise = fetch('/api/facebook/adaccounts', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            const googleCheckPromise = fetch('/api/user/connections', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Aguarda a resolução de ambas as promessas.
            const [metaRes, googleRes] = await Promise.all([metaCheckPromise, googleCheckPromise]);

            // Processa a resposta da Meta.
            const metaData = await metaRes.json();
            const isMetaConnected = metaRes.ok && Array.isArray(metaData) && metaData.length > 0;

            // Processa a resposta do Google.
            const googleData = await googleRes.json();
            const isGoogleConnected = googleRes.ok && !!googleData.connections?.google;

            // Atualiza o estado da UI com os resultados reais.
            setConnections({ meta: isMetaConnected, google: isGoogleConnected });

        } catch (error) {
            console.error("Erro ao verificar conexões:", error);
            // Em caso de erro, assume que nenhuma conta está conectada.
            setConnections({ meta: false, google: false });
        } finally {
            // Garante que o estado de carregamento é desativado no final.
            setIsLoadingConnections(false);
        }
    };
    
    // Inicia o fluxo de conexão com a Meta (Facebook).
    const handleMetaConnect = () => {
        if (!user) return;
        const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;
        const scope = 'public_profile,email,ads_management,ads_read,business_management';
        const state = user.uid;

        const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
        
        window.location.href = authUrl;
    };

    // Desconecta a conta da Meta.
    const handleMetaDisconnect = async () => {
        if (!user) return;
        const confirmed = window.confirm("Tem a certeza de que deseja desconectar a sua conta da Meta? Será necessário conectá-la novamente para gerir as suas campanhas.");
        if (!confirmed) return;
        
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken(true);
            const response = await fetch('/api/facebook/disconnect', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (!response.ok) throw new Error("A falha ocorreu ao desconectar.");
            alert("Conta da Meta desconectada com sucesso!");
            await checkAllConnections(); // Recarrega o estado das conexões para atualizar a UI.
        } catch (error: any) {
            alert(`Erro ao desconectar: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Inicia o fluxo de conexão com o Google.
    const handleGoogleConnect = () => {
        if (!user) return;
        
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
        const scope = 'https://www.googleapis.com/auth/adwords';
        const state = user.uid;

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

        window.location.href = authUrl;
    };
    
    // Renderiza um estado de carregamento enquanto a autenticação ou as conexões são verificadas.
    if (authLoading || isLoadingConnections) {
        return (
             <DashboardLayout>
                <div className="flex flex-col h-full w-full items-center justify-center text-white">
                    <Rocket className="animate-pulse h-10 w-10 mb-4" />
                    <p>A carregar as suas configurações...</p>
                </div>
             </DashboardLayout>
        );
    }

    return(
        <DashboardLayout>
            <div className="w-full">
                <h1 className="text-3xl font-bold text-white mb-4">Canais e Conexões</h1>
                <p className="text-gray-400 mb-8">Gerencie as plataformas conectadas à sua conta B2Y Marketing para automatizar suas campanhas.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card da Meta */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center space-x-4"><FaFacebook className="h-10 w-10 text-[#0066ff]"/><div><h3 className="text-lg font-bold text-white">Meta</h3><p className="text-sm text-gray-400">Facebook & Instagram Ads</p></div></div>
                        <div className="mt-4">
                            {connections.meta ? (
                                <button onClick={handleMetaDisconnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                    {isProcessing ? "A Desconectar..." : "Desconectar"}
                                </button>
                            ) : (
                                <button onClick={handleMetaConnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                                    {isProcessing ? "A Processar..." : "Conectar"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card do Google */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center space-x-4"><FaGoogle className="h-10 w-10"/><div><h3 className="text-lg font-bold text-white">Google</h3><p className="text-sm text-gray-400">Google Ads</p></div></div>
                        <div className="mt-4">
                            {connections.google ? (
                                <div className="flex items-center justify-center space-x-2 text-sm font-semibold text-green-400"><LinkIcon size={16}/><span>Conectado</span></div>
                            ) : (
                                <button onClick={handleGoogleConnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                                    {isProcessing ? "A Processar..." : "Conectar"}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Card do LinkedIn (Desativado) */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between opacity-50">
                        <div className="flex items-center space-x-4"><FaLinkedin className="h-10 w-10 text-[#0077B5]"/><div><h3 className="text-lg font-bold text-white">LinkedIn</h3><p className="text-sm text-gray-400">LinkedIn Ads</p></div></div>
                        <div className="mt-4"><button disabled className="w-full font-semibold text-sm bg-gray-600 text-white py-2 px-4 rounded-lg cursor-not-allowed">Em breve</button></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}