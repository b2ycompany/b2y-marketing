"use client";

// Tipo para os dados de targeting que vamos manipular
export type TargetingData = {
  age_min: number;
  age_max: number;
  genders: number[]; // 1 para Homem, 2 para Mulher
  geo_locations: {
    countries: string[];
    // Futuramente podemos adicionar: cities, regions, zips
  };
};

type TargetingEditorProps = {
  targeting: TargetingData;
  setTargeting: React.Dispatch<React.SetStateAction<TargetingData>>;
};

export default function TargetingEditor({ targeting, setTargeting }: TargetingEditorProps) {
  
  const handleGenderChange = (gender: number) => {
    const newGenders = targeting.genders.includes(gender)
      ? targeting.genders.filter(g => g !== gender)
      : [...targeting.genders, gender];
    setTargeting(prev => ({ ...prev, genders: newGenders.sort() }));
  };

  return (
    <div className="space-y-6 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Gênero</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 text-sm text-white cursor-pointer">
            <input type="checkbox" checked={targeting.genders.includes(1)} onChange={() => handleGenderChange(1)} className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"/>
            <span>Masculino</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-white cursor-pointer">
            <input type="checkbox" checked={targeting.genders.includes(2)} onChange={() => handleGenderChange(2)} className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"/>
            <span>Feminino</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">Deixe ambos desmarcados para "Todos".</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Faixa Etária</label>
        <div className="flex items-center space-x-3 mt-2">
            <input type="number" value={targeting.age_min} onChange={e => setTargeting(prev => ({ ...prev, age_min: parseInt(e.target.value) }))} className="w-20 bg-gray-900 border-gray-600 rounded-md px-3 py-2"/>
            <span className="text-gray-400">-</span>
            <input type="number" value={targeting.age_max} onChange={e => setTargeting(prev => ({ ...prev, age_max: parseInt(e.target.value) }))} className="w-20 bg-gray-900 border-gray-600 rounded-md px-3 py-2"/>
        </div>
      </div>
      
      <div>
        <label htmlFor="countries" className="block text-sm font-medium text-gray-300">Localização (País)</label>
        <input type="text" id="countries" value={targeting.geo_locations.countries.join(', ')} onChange={e => setTargeting(prev => ({ ...prev, geo_locations: { ...prev.geo_locations, countries: e.target.value.split(',').map(c => c.trim().toUpperCase()) } }))} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" placeholder="Ex: BR, US, PT"/>
        <p className="text-xs text-gray-500 mt-1">Use códigos de 2 letras, separados por vírgula.</p>
      </div>
    </div>
  );
}