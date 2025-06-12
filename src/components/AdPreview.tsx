"use client";

import { Facebook } from "lucide-react";

// Tipos para as props
type AdPreviewProps = {
  pageName: string;
  pageImage: string;
  message: string;
  headline: string;
  link: string;
  imageUrl: string;
};

export default function AdPreview({ pageName, pageImage, message, headline, link, imageUrl }: AdPreviewProps) {
  
  // --- INÍCIO DA CORREÇÃO ---
  let linkDomain = 'SEUSITE.COM'; // Define um valor padrão
  
  try {
    // Só tenta analisar a URL se o campo 'link' não for vazio
    if (link && link.startsWith('http')) {
      linkDomain = new URL(link).hostname.replace('www.', '').toUpperCase();
    }
  } catch (error) {
    // Se a URL for inválida (ex: "abc"), o 'try...catch' impede o crash
    // e mantém o valor padrão. Nós também podemos logar um aviso.
    console.warn("URL inválida fornecida para o preview:", link);
  }
  // --- FIM DA CORREÇÃO ---

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden sticky top-10">
      <div className="p-4">
        <div className="flex items-center">
          {pageImage ? (
            <img className="h-10 w-10 rounded-full object-cover" src={pageImage} alt={pageName} />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Facebook size={20} className="text-gray-500"/>
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{pageName || "Nome da Página"}</p>
            <p className="text-xs text-gray-400">Patrocinado</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-4 min-h-[40px]">
            {message || "Texto principal do seu anúncio aparecerá aqui."}
        </p>
      </div>
      <div className="h-64 bg-gray-700 flex items-center justify-center">
        {imageUrl && imageUrl.startsWith('http') ? (
            <img className="h-full w-full object-cover" src={imageUrl} alt="Preview do anúncio" />
        ) : (
            <p className="text-gray-500 text-sm">Sua imagem aparecerá aqui</p>
        )}
      </div>
      <div className="p-4 bg-gray-700/50 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">{linkDomain}</p>
          <p className="text-sm font-bold text-white truncate">{headline || "Título do seu anúncio"}</p>
        </div>
        <div className="bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded">
          Saiba mais
        </div>
      </div>
    </div>
  );
}