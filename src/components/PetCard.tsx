import { PawPrint } from 'lucide-react';
import type { Pet } from '../types';

interface PetCardProps {
  pet: Pet;
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const PetCard = ({ pet, isActive = false, onClick, compact = false }: PetCardProps) => {
  const ageText = pet.ageMonths >= 12
    ? `${Math.floor(pet.ageMonths / 12)}岁${pet.ageMonths % 12 > 0 ? pet.ageMonths % 12 + '个月' : ''}`
    : `${pet.ageMonths}个月`;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
          isActive
            ? 'bg-primary-100 border-2 border-primary-300'
            : 'bg-white border-2 border-transparent hover:border-primary-100'
        }`}
      >
        <img
          src={pet.avatar}
          alt={pet.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-neutral-800">{pet.name}</h3>
          <p className="text-xs text-neutral-500">{pet.breed}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-lg shadow-primary-200 scale-[1.02]'
          : 'bg-white hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-neutral-800'}`}>
            {pet.name}
          </h3>
          <p className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-neutral-500'}`}>
            {pet.breed}
          </p>
        </div>
        <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-primary-50'}`}>
          <PawPrint 
            size={20} 
            className={isActive ? 'text-white' : 'text-primary-500'} 
          />
        </div>
      </div>
      
      <div className="flex gap-4 mt-4">
        <div>
          <p className={`text-xs ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>年龄</p>
          <p className={`font-semibold ${isActive ? 'text-white' : 'text-neutral-700'}`}>{ageText}</p>
        </div>
        <div>
          <p className={`text-xs ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>体重</p>
          <p className={`font-semibold ${isActive ? 'text-white' : 'text-neutral-700'}`}>{pet.weightKg}kg</p>
        </div>
      </div>
      
      <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20">
        <img
          src={pet.avatar}
          alt=""
          className="w-full h-full object-cover rounded-full blur-sm"
        />
      </div>
    </div>
  );
};

export default PetCard;
