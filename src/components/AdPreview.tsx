"use client";

import { Facebook } from "lucide-react";

// Tipos para as props que este componente receberá
type AdPreviewProps = {
  pageName: string;
  pageImage: string;
  message: string;
  headline: string;
  link: string;
  imageUrl: string;
};

export default function AdPreview({ pageName, pageImage, message, headline, link, imageUrl }: AdPreviewProps) {
  // Extrai o domínio principal do link para exibir
  const linkDomain = new URL(link).hostname.replace('www.', '').toUpperCase();

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden sticky top-10">
      <div className="p-4">
        {/* Cabeçalho do Post */}
        <div className="flex items-center">
          <img className="h-10 w-10 rounded-full object-cover" src={pageImage || '/default-page-icon.png'} alt={pageName} />
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{pageName || "Nome da Página"}</p>
            <p className="text-xs text-gray-400">Patrocinado</p>
          </div>
        </div>
        {/* Corpo do Post */}
        <p className="text-gray-300 text-sm mt-4">{message || "Texto principal do seu anúncio aparecerá aqui."}</p>
      </div>
      {/* Imagem do Anúncio */}
      <div className="h-64 bg-gray-700 flex items-center justify-center">
        {imageUrl ? (
            <img className="h-full w-full object-cover" src={imageUrl} alt="Preview do anúncio" />
        ) : (
            <p className="text-gray-500">Sua imagem aparecerá aqui</p>
        )}
      </div>
      {/* Rodapé com o Link */}
      <div className="p-4 bg-gray-700/50 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">{linkDomain}</p>
          <p className="text-sm font-bold text-white">{headline || "Título do seu anúncio"}</p>
        </div>
        <button className="bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded">
          Saiba mais
        </button>
      </div>
    </div>
  );
}