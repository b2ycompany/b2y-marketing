"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

type StatusToggleProps = {
  objectId: string;
  initialStatus: string;
};

export default function StatusToggle({ objectId, initialStatus }: StatusToggleProps) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(initialStatus === 'ACTIVE');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async () => {
    if (!user) return;
    setIsLoading(true);

    const newStatus = !isActive ? 'ACTIVE' : 'PAUSED';

    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/facebook/update-status', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectId, newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar status.');
      }
      
      // Se a chamada foi um sucesso, atualiza o estado visual do interruptor
      setIsActive(!isActive);

    } catch (error: any) {
      alert(`Erro: ${error.message}`); // Exibe um alerta simples em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = isActive ? 'bg-primary' : 'bg-gray-600';
  const dotPosition = isActive ? 'translate-x-5' : 'translate-x-0';

  return (
    <button
      onClick={handleChange}
      disabled={isLoading}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none disabled:opacity-50 ${bgColor}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${dotPosition}`} />
      {isLoading && <div className="absolute inset-0 flex items-center justify-center text-xs text-white">...</div>}
    </button>
  );
}