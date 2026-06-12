import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet, WeightRecord, VaccineRecord, DewormRecord } from '../types';
import { mockPets, mockWeightRecords, mockVaccineRecords, mockDewormRecords } from '../data/mockData';

interface PetStore {
  pets: Pet[];
  currentPetId: string;
  weightRecords: WeightRecord[];
  vaccineRecords: VaccineRecord[];
  dewormRecords: DewormRecord[];
  
  setCurrentPet: (id: string) => void;
  getCurrentPet: () => Pet | undefined;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => void;
  getWeightRecordsForPet: (petId: string) => WeightRecord[];
  
  addVaccineRecord: (record: Omit<VaccineRecord, 'id'>) => void;
  getVaccineRecordsForPet: (petId: string) => VaccineRecord[];
  
  addDewormRecord: (record: Omit<DewormRecord, 'id'>) => void;
  getDewormRecordsForPet: (petId: string) => DewormRecord[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: mockPets,
      currentPetId: mockPets[0]?.id || '',
      weightRecords: mockWeightRecords,
      vaccineRecords: mockVaccineRecords,
      dewormRecords: mockDewormRecords,

      setCurrentPet: (id) => set({ currentPetId: id }),
      
      getCurrentPet: () => {
        const { pets, currentPetId } = get();
        return pets.find(p => p.id === currentPetId);
      },

      addPet: (pet) => {
        const newPet: Pet = {
          ...pet,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          pets: [...state.pets, newPet],
          currentPetId: newPet.id,
        }));
      },

      updatePet: (id, updates) => {
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePet: (id) => {
        set((state) => {
          const newPets = state.pets.filter((p) => p.id !== id);
          return {
            pets: newPets,
            currentPetId: state.currentPetId === id 
              ? (newPets[0]?.id || '') 
              : state.currentPetId,
          };
        });
      },

      addWeightRecord: (record) => {
        const newRecord: WeightRecord = {
          ...record,
          id: generateId(),
        };
        set((state) => ({
          weightRecords: [...state.weightRecords, newRecord],
        }));
      },

      getWeightRecordsForPet: (petId) => {
        return get().weightRecords
          .filter((r) => r.petId === petId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      addVaccineRecord: (record) => {
        const newRecord: VaccineRecord = {
          ...record,
          id: generateId(),
        };
        set((state) => ({
          vaccineRecords: [...state.vaccineRecords, newRecord],
        }));
      },

      getVaccineRecordsForPet: (petId) => {
        return get().vaccineRecords
          .filter((r) => r.petId === petId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      addDewormRecord: (record) => {
        const newRecord: DewormRecord = {
          ...record,
          id: generateId(),
        };
        set((state) => ({
          dewormRecords: [...state.dewormRecords, newRecord],
        }));
      },

      getDewormRecordsForPet: (petId) => {
        return get().dewormRecords
          .filter((r) => r.petId === petId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
    }),
    {
      name: 'pet-training-pet-store',
    }
  )
);
