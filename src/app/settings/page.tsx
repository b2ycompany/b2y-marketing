"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { LinkIcon, Rocket } from "lucide-react";

// Ícones para os logos
const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.34 1.62-4.08 1.62-3.42 0-6.21-2.82-6.21-6.21s2.79-6.21 6.21-6.21c1.87 0 3.13.79 3.86 1.5l2.64-2.58C16.97 3.01 15.08 2 12.48 2c-5.46 0-9.91 4.45-9.91 9.91s4.45 9.91 9.91 9.91c5.22 0 9.4-3.55 9.4-9.65 0-.6-.07-1.12-.16-1.62H12.48z" fill="#4285F4"/></svg>;
const MetaIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10"><title>Meta</title><path d="M22.642 10.153c-1.042-3.136-4.238-5.32-8.238-5.32-4.232 0-7.75 2.37-8.238 5.32-.242.96-.363 2.148-.363 3.565 0 1.93.182 3.29.363 3.565 1.041 3.136 4.238 5.32 8.238 5.32 4.232 0 7.75-2.37 8.238-5.32.242-.96.363-2.148-.363-3.565 0-1.93-.182-3.29-.363-3.565zM12.016 24C5.376 24 0 18.624 0 12.016S5.376 0 12.016 0s12.016 5.376 12.016 12.016-5.376 11.984-12.016 11.984z" fill="#0066ff"/></svg>;
const LinkedInIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" fill="#0077B5"/></svg>;

// Novo tipo para as conexões
type Connections = {
  meta?: object;
  google?: object;
};

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [connections, setConnections] = useState<Connections | null>(null);
    const [isLoadingConnections, setIsLoadingConnections] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchConnections();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchConnections = async () => {
        if (!user) return;
        setIsLoadingConnections(true);
        try {
            const idToken = await user.getIdToken(true);
            const response = await fetch('/api/user/connections', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error("Falha ao carregar o estado das conexões.");
            setConnections(data.connections);
        } catch (error) {
            console.error(error);
            setConnections({}); // Define como vazio em caso de erro
        } finally {
            setIsLoadingConnections(false);
        }
    };
    
    const handleGoogleConnect = () => {
        if (!user) return;
        
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
        // O scope para a API do Google Ads. É importante pedir permissão para gerenciar as campanhas.
        const scope = 'https://www.googleapis.com/auth/adwords';
        const state = user.uid;

        // O 'access_type=offline' é crucial para pedir o 'refresh_token', que nos permite
        // renovar o acesso sem pedir para o usuário logar de novo.
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

        window.location.href = authUrl;
    };

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
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'A falha ocorreu ao desconectar.');
            alert("Conta da Meta desconectada com sucesso!");
            await fetchConnections(); // Recarrega o estado das conexões para atualizar a UI
        } catch (error: any) {
            alert(`Erro ao desconectar: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Mostra um estado de carregamento geral enquanto a autenticação ou as conexões estão a ser verificadas.
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
                        <div className="flex items-center space-x-4"><MetaIcon /><div><h3 className="text-lg font-bold text-white">Meta</h3><p className="text-sm text-gray-400">Facebook & Instagram Ads</p></div></div>
                        <div className="mt-4">
                            {connections?.meta ? (
                                <button onClick={handleMetaDisconnect} disabled={isProcessing} className="w-full font-semibold text-sm bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                    {isProcessing ? "A Desconectar..." : "Desconectar"}
                                </button>
                            ) : (
                                <button className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90">
                                    Conectar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card do Google */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center space-x-4"><GoogleIcon /><div><h3 className="text-lg font-bold text-white">Google</h3><p className="text-sm text-gray-400">Google Ads</p></div></div>
                        <div className="mt-4">
                            {connections?.google ? (
                                <div className="flex items-center space-x-2 text-sm font-semibold text-green-400"><LinkIcon size={16}/><span>Conectado</span></div>
                            ) : (
                                <button onClick={handleGoogleConnect} className="w-full font-semibold text-sm bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90">
                                    Conectar
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Card do LinkedIn (Desativado) */}
                    <div className="bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col justify-between opacity-50">
                        <div className="flex items-center space-x-4"><LinkedInIcon /><div><h3 className="text-lg font-bold text-white">LinkedIn</h3><p className="text-sm text-gray-400">LinkedIn Ads</p></div></div>
                        <div className="mt-4"><button disabled className="w-full font-semibold text-sm bg-gray-600 text-white py-2 px-4 rounded-lg cursor-not-allowed">Em breve</button></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}