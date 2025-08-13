"use client";

import { useState } from 'react';
import { ImageUp, CircleDollarSign, Calendar, Target, FileText, Lightbulb } from 'lucide-react';

type CampaignFormProps = {
  selectedPlatforms: string[];
  onBack: () => void; // Função para voltar ao seletor de plataformas
};

// Interface para estruturar os dados do nosso formulário
interface FormData {
  campaignName: string;
  objective: string;
  mediaFile: File | null;
  mediaPreview: string;
  headline: string;
  bodyText: string;
  budgetValue: string;
  startDate: string;
  endDate: string;
  targetLocation: string;
  targetAgeMin: string;
  targetAgeMax: string;
}

export default function CampaignForm({ selectedPlatforms, onBack }: CampaignFormProps) {
  const [formData, setFormData] = useState<FormData>({
    campaignName: `Campanha de ${selectedPlatforms.join(', ')} ${new Date().toLocaleDateString('pt-BR')}`,
    objective: '',
    mediaFile: null,
    mediaPreview: '',
    headline: '',
    bodyText: '',
    budgetValue: '50',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetLocation: 'Brasil',
    targetAgeMin: '18',
    targetAgeMax: '65',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        mediaFile: file,
        mediaPreview: URL.createObjectURL(file), // Cria um URL local para o preview da imagem/vídeo
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui virá a lógica para enviar os dados para a nossa API (o "Motor de Publicação")
    console.log("Dados da Campanha a serem enviados:", formData);
    alert("Campanha pronta para ser enviada para o backend!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-white animate-fade-in">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mb-6">&larr; Voltar e selecionar outras plataformas</button>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
        <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="text-primary"/>
            <h2 className="text-xl font-semibold">1. Detalhes da Campanha</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-300">Nome da Campanha</label>
              <input type="text" name="campaignName" id="campaignName" value={formData.campaignName} onChange={handleInputChange} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2"/>
            </div>
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-300">Qual o principal objetivo?</label>
              <select name="objective" id="objective" value={formData.objective} onChange={handleInputChange} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2">
                <option value="" disabled>Selecione um objetivo...</option>
                <option value="REACH">Alcance (Mostrar para o máximo de pessoas)</option>
                <option value="TRAFFIC">Tráfego (Levar pessoas para o seu site)</option>
                <option value="LEAD_GENERATION">Geração de Leads (Capturar contactos)</option>
                <option value="CONVERSIONS">Vendas (Gerar compras no seu site/app)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: MÍDIA E CRIATIVO */}
        <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4"><ImageUp className="text-primary"/><h2 className="text-xl font-semibold">2. Mídia e Texto</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label htmlFor="headline" className="block text-sm font-medium text-gray-300">Título do Anúncio</label>
                  <input type="text" name="headline" id="headline" value={formData.headline} onChange={handleInputChange} maxLength={40} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2" placeholder="Ex: Promoção Imperdível!"/>
              </div>
              <div>
                  <label htmlFor="bodyText" className="block text-sm font-medium text-gray-300">Texto Principal</label>
                  <textarea name="bodyText" id="bodyText" value={formData.bodyText} onChange={handleInputChange} rows={5} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2" placeholder="Descreva a sua oferta aqui..."></textarea>
              </div>
            </div>
            <div>
              <label htmlFor="mediaFile" className="block text-sm font-medium text-gray-300 mb-1">Imagem ou Vídeo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {formData.mediaPreview ? (
                     <img src={formData.mediaPreview} alt="Preview" className="mx-auto h-40 rounded-md"/>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                  <div className="flex text-sm text-gray-500"><label htmlFor="mediaFile" className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-primary hover:text-primary/80"><span>Carregue um ficheiro</span><input id="mediaFile" name="mediaFile" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*"/></label><p className="pl-1">ou arraste e solte</p></div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 até 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: ORÇAMENTO E SEGMENTAÇÃO */}
        <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
           <div className="flex items-center space-x-3 mb-4"><CircleDollarSign className="text-primary"/><h2 className="text-xl font-semibold">3. Orçamento e Duração</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="budgetValue" className="block text-sm font-medium text-gray-300">Orçamento Total (R$)</label>
                    <input type="number" name="budgetValue" id="budgetValue" value={formData.budgetValue} onChange={handleInputChange} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2" min="1"/>
                </div>
                 <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Data de Início</label>
                    <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2"/>
                </div>
                 <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">Data de Fim (Opcional)</label>
                    <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleInputChange} className="mt-1 w-full bg-gray-900 border-gray-600 rounded-md p-2"/>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end pt-4">
            <button type="submit" className="bg-primary text-white font-bold text-lg py-3 px-12 rounded-lg hover:opacity-90 disabled:opacity-40 transition-all">
                Disparar Campanha
            </button>
        </div>
      </form>
    </div>
  );
}