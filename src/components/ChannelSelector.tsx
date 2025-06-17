"use client";

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

// Ícones para os logos
const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.34 1.62-4.08 1.62-3.42 0-6.21-2.82-6.21-6.21s2.79-6.21 6.21-6.21c1.87 0 3.13.79 3.86 1.5l2.64-2.58C16.97 3.01 15.08 2 12.48 2c-5.46 0-9.91 4.45-9.91 9.91s4.45 9.91 9.91 9.91c5.22 0 9.4-3.55 9.4-9.65 0-.6-.07-1.12-.16-1.62H12.48z" fill="#4285F4"/></svg>;
const MetaIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><title>Meta</title><path d="M22.642 10.153c-1.042-3.136-4.238-5.32-8.238-5.32-4.232 0-7.75 2.37-8.238 5.32-.242.96-.363 2.148-.363 3.565 0 1.93.182 3.29.363 3.565 1.041 3.136 4.238 5.32 8.238 5.32 4.232 0 7.75-2.37 8.238-5.32.242-.96.363-2.148-.363-3.565 0-1.93-.182-3.29-.363-3.565zM12.016 24C5.376 24 0 18.624 0 12.016S5.376 0 12.016 0s12.016 5.376 12.016 12.016-5.376 11.984-12.016 11.984z" fill="#0066ff"/></svg>;
const LinkedInIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" fill="#0077B5"/></svg>;

const channels = [
    { id: 'meta', name: 'Meta', description: 'Facebook & Instagram', icon: <MetaIcon /> },
    { id: 'google', name: 'Google', description: 'Pesquisa & YouTube', icon: <GoogleIcon /> },
    { id: 'linkedin', name: 'LinkedIn', description: 'Anúncios B2B', icon: <LinkedInIcon />, disabled: true },
];

type ChannelSelectorProps = {
    selectedChannels: string[];
    onChannelToggle: (channelId: string) => void;
};

export default function ChannelSelector({ selectedChannels, onChannelToggle }: ChannelSelectorProps) {
    return (
        <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-1">Selecione os Canais</h2>
            <p className="text-sm text-gray-400 mb-6">Onde sua campanha será veiculada? Você pode escolher um ou mais.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map(channel => {
                    const isSelected = selectedChannels.includes(channel.id);
                    return (
                        <div
                            key={channel.id}
                            onClick={() => !channel.disabled && onChannelToggle(channel.id)}
                            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all
                                ${channel.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary'}
                                ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-700'}
                            `}
                        >
                            {isSelected && (
                                <CheckCircle className="absolute -top-2 -right-2 text-primary bg-dark-card rounded-full" size={20}/>
                            )}
                            <div className="flex items-center space-x-4">
                                {channel.icon}
                                <div>
                                    <h3 className="font-bold text-white">{channel.name}</h3>
                                    <p className="text-xs text-gray-400">{channel.description}</p>
                                </div>
                            </div>
                            {channel.disabled && <span className="absolute bottom-2 right-2 text-xs text-yellow-400 font-semibold">Em breve</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}