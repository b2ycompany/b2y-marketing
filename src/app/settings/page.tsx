"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { LinkIcon, Rocket } from "lucide-react";
import { FaFacebook, FaGoogle, FaLinkedin } from "react-icons/fa";

export default function SettingsPage() {
    // Obtém todos os dados e funções necessárias do nosso AuthContext centralizado.
    // 'connections' é o estado real, e 'recheckConnections' é a função para atualizá-lo.
    const { user, connections, recheckConnections, loading } = useAuth();
    
    // Estado local da página para feedback visual durante as ações.
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Função para iniciar o fluxo de conexão com a Meta (Facebook).
    const handleMetaConnect = () => {
        if (!user) return;
        const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;
        const scope = 'public_profile,email,ads_management,ads_read,business_management';
        const state = user.uid;

        const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
        
        window.location.href = authUrl;
    };

    // Função para iniciar o fluxo de conexão com o Google.
    const handleGoogleConnect = () => {
        if (!user) return;
        
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
        const scope = 'https://www.googleapis.com/auth/adwords';
        const state = user.uid;

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

        window.location.href = authUrl;
    };
    
    // Função unificada para desconectar uma plataforma.
    const handleDisconnect = async (platform: 'meta' | 'google') => {
        if (!user) return;
        
        const platformName = platform === 'meta' ? 'Meta' : 'Google';
        const confirmed = window.confirm(`Tem a certeza de que deseja desconectar a sua conta do ${platformName}?`);
        if (!confirmed) return;
        
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken(true);
            const apiPath = platform === 'meta' ? '/api/facebook/disconnect' : '/api/auth/google/disconnect';
            
            const response = await fetch(apiPath, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `A falha ocorreu ao desconectar ${platformName}.`);
            }
            
            alert(`Conta do ${platformName} desconectada com sucesso!`);
            
            // Pede ao AuthContext para verificar novamente o estado de todas as conexões.
            // Isto garante que a UI será atualizada em toda a aplicação.
            await recheckConnections(); 
        } catch (error: any) {
            alert(`Erro ao desconectar: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Exibe um ecrã de carregamento enquanto o AuthContext inicializa.
    if (loading) {
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
                <p className="text-gray-400 mb-8">Gerencie as plataformas conectadas à sua conta B2Y Marketing.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Card da Meta */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center space-x-4 mb-4"><FaFacebook className="h-10 w-10 text-[#0066ff]"/><div><h3 className="text-lg font-bold text-white">Meta</h3><p className="text-sm text-gray-400">Facebook & Instagram Ads</p></div></div>
                        <div>
                            {connections.meta ? (
                                <button onClick={() => handleDisconnect('meta')} disabled={isProcessing} className="w-full font-semibold text-sm bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                    {isProcessing ? "A processar..." : "Desconectar"}
                                </button>
                            ) : (
                                <button onClick={handleMetaConnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                                    {isProcessing ? "A processar..." : "Conectar"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card do Google */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center space-x-4 mb-4"><FaGoogle className="h-10 w-10"/><div><h3 className="text-lg font-bold text-white">Google</h3><p className="text-sm text-gray-400">Google Ads</p></div></div>
                        <div>
                            {connections.google ? (
                                <button onClick={() => handleDisconnect('google')} disabled={isProcessing} className="w-full font-semibold text-sm bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                    {isProcessing ? "A processar..." : "Desconectar"}
                                </button>
                            ) : (
                                <button onClick={handleGoogleConnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                                    {isProcessing ? "A processar..." : "Conectar"}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Card do LinkedIn (Desativado) */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between opacity-50">
                        <div className="flex items-center space-x-4 mb-4"><FaLinkedin className="h-10 w-10 text-[#0077B5]"/><div><h3 className="text-lg font-bold text-white">LinkedIn</h3><p className="text-sm text-gray-400">LinkedIn Ads</p></div></div>
                        <div>
                            <button disabled className="w-full font-semibold text-sm bg-gray-600 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                                Em breve
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}