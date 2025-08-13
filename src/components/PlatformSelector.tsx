"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaFacebook, FaGoogle, FaTiktok, FaCheckCircle } from 'react-icons/fa';
import { Rocket } from 'lucide-react';

// Definindo o tipo para o status das conexões
type ConnectionsStatus = {
    meta: boolean;
    google: boolean;
    tiktok: boolean;
};

// Adicionamos a propriedade 'onContinue' para comunicação com a página pai.
type PlatformSelectorProps = {
    onContinue: (selectedPlatforms: string[]) => void;
};

export default function PlatformSelector({ onContinue }: PlatformSelectorProps) {
    const { user } = useAuth();
    const [connections, setConnections] = useState<ConnectionsStatus>({ meta: false, google: false, tiktok: false });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            fetchConnections();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchConnections = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const idToken = await user.getIdToken(true);
            const response = await fetch('/api/user/connections', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error("Falha ao carregar conexões.");

            setConnections({
                meta: !!data.connections?.meta,
                google: !!data.connections?.google,
                tiktok: !!data.connections?.tiktok,
            });
        } catch (error) {
            console.error(error);
            setConnections({ meta: false, google: false, tiktok: false });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlatform = (platformId: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(platformId) 
                ? prev.filter(p => p !== platformId) 
                : [...prev, platformId]
        );
    };

    const platforms = [
        { name: 'Meta', id: 'meta', icon: <FaFacebook className="h-12 w-12 text-blue-500" />, connected: connections.meta, description: "Facebook & Instagram" },
        { name: 'Google', id: 'google', icon: <FaGoogle className="h-12 w-12" />, connected: connections.google, description: "Pesquisa & Display" },
        { name: 'TikTok', id: 'tiktok', icon: <FaTiktok className="h-12 w-12 text-white" />, connected: connections.tiktok, description: "Vídeos Curtos" },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center text-white">
                <Rocket className="animate-pulse h-10 w-10 mb-4" />
                <p>A verificar as suas conexões...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto text-white animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Onde a sua campanha vai brilhar?</h1>
                <p className="text-gray-400 mt-2">Selecione uma ou mais plataformas para começar a criar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {platforms.map(platform => (
                    <div 
                        key={platform.id}
                        onClick={() => platform.connected && togglePlatform(platform.id)}
                        className={`
                            relative border-2 rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all duration-300 transform
                            ${platform.connected ? 'cursor-pointer hover:border-primary hover:-translate-y-2' : 'opacity-40 cursor-not-allowed bg-gray-800/50'}
                            ${selectedPlatforms.includes(platform.id) ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-700'}
                        `}
                    >
                        {selectedPlatforms.includes(platform.id) && (
                            <FaCheckCircle className="absolute top-4 right-4 text-green-400 text-2xl" />
                        )}

                        <div className="mb-4">{platform.icon}</div>
                        <h2 className="text-2xl font-bold">{platform.name}</h2>
                        <p className="text-sm text-gray-400">{platform.description}</p>
                        
                        {!platform.connected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="mt-2 text-xs bg-gray-600 text-white px-3 py-1 rounded-full">Conecte nas Configurações</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-12">
                <button 
                    onClick={() => onContinue(selectedPlatforms)}
                    disabled={selectedPlatforms.length === 0}
                    className="bg-primary text-white font-bold text-lg py-3 px-12 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    Continuar com {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'plataforma' : 'plataformas'}
                </button>
            </div>
        </div>
    );
}