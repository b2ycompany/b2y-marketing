"use client";

import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, BadgeCheck, FileText, Briefcase, Facebook } from 'lucide-react';

const checklistItems = [
    { icon: <Briefcase className="text-blue-400" />, title: "Crie uma Conta de Negócios (Portfólio)", description: "Esta é a estrutura principal para gerenciar seus ativos de forma profissional.", link: "https://business.facebook.com/overview" },
    { icon: <FileText className="text-blue-400" />, title: "Crie uma Conta de Anúncios", description: "Dentro da sua Conta de Negócios, crie uma nova conta dedicada para seus anúncios.", link: "https://business.facebook.com/settings/ad-accounts" },
    { icon: <AlertTriangle className="text-yellow-400" />, title: "Inicie a Verificação da Empresa", description: "Essencial para desbloquear todo o poder da API de Marketing.", link: "https://business.facebook.com/settings/security-center" },
    { icon: <BadgeCheck className="text-green-400" />, title: "Tudo Pronto!", description: "Quando os passos acima estiverem completos, sua plataforma estará pronta para criar campanhas.", link: "" }
];

type SetupGuideProps = {
    onRecheck: () => void;
    isLoading: boolean;
};

export default function SetupGuide({ onRecheck, isLoading }: SetupGuideProps) {
    const { user } = useAuth(); // Pegamos o usuário do nosso contexto de autenticação

    // Esta é a mesma função que usamos antes para iniciar o fluxo OAuth
    const handleFacebookConnect = () => {
        if (!user) return; // Garante que temos um usuário

        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;
        const scope = "pages_show_list,pages_read_engagement,ads_management,business_management";
        const state = user.uid; // Usamos o UID do nosso usuário para segurança
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

        const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
        
        // Redireciona a janela atual para a URL de autorização do Facebook.
        window.location.href = authUrl;
    };

    return (
        <div className="p-8 bg-dark-card rounded-xl shadow-lg border border-yellow-500/30 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="text-yellow-400" size={28} />
                <h2 className="text-2xl font-bold text-white">Conecte sua Conta Meta</h2>
            </div>
            <p className="text-gray-300 mb-8">
                Para criar campanhas, primeiro você precisa conectar sua conta do Facebook/Instagram e nos dar permissão para gerenciá-la. Antes de conectar, certifique-se de que sua conta Meta atende aos requisitos abaixo.
            </p>

            {/* Botão de Conexão - O ELO PERDIDO! */}
            <div className="mb-8">
                <button
                    onClick={handleFacebookConnect}
                    className="w-full font-bold py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                    <Facebook size={20} />
                    <span>Conectar com Facebook</span>
                </button>
            </div>
            
            <div className="space-y-6">
                {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900/70 rounded-full flex items-center justify-center">{item.icon}</div>
                        <div>
                            <h3 className="font-semibold text-white">{item.title}</h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                            {item.link && (<a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Ir para a página →</a>)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
                <button onClick={onRecheck} disabled={isLoading} className="w-full font-bold py-2.5 px-4 rounded-lg text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 transition">
                    {isLoading ? "Verificando..." : "Já conectei e configurei, verificar novamente"}
                </button>
            </div>
        </div>
    );
}