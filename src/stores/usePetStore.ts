import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet, WeightRecord, VaccineRecord, DewormRecord, TrainingGoal, FamilyMember } from '../types';
import { mockPets, mockWeightRecords, mockVaccineRecords, mockDewormRecords } from '../data/mockData';

interface PetStore {
  pets: Pet[];
  currentPetId: string;
  weightRecords: WeightRecord[];
  vaccineRecords: VaccineRecord[];
  dewormRecords: DewormRecord[];
  trainingGoals: TrainingGoal[];
  familyMembers: FamilyMember[];
  currentMemberId: string;
  
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

  addTrainingGoal: (goal: Omit<TrainingGoal, 'id' | 'currentValue'>) => void;
  updateTrainingGoal: (id: string, updates: Partial<TrainingGoal>) => void;
  deleteTrainingGoal: (id: string) => void;
  getGoalsForPet: (petId: string) => TrainingGoal[];

  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  getCurrentMember: () => FamilyMember | undefined;
  getMemberById: (id: string) => FamilyMember | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'member-1',
    name: '小主人',
    role: 'owner',
    color: '#FF8C42',
    createdAt: '2025-01-01',
  },
];

const mockTrainingGoals: TrainingGoal[] = [
  {
    id: 'goal-1',
    petId: 'pet-1',
    goalType: 'frequency',
    targetValue: 5,
    currentValue: 0,
    description: '本周训练5次',
  },
  {
    id: 'goal-2',
    petId: 'pet-1',
    goalType: 'mastery',
    targetValue: 4,
    currentValue: 0,
    courseId: 'course-3',
    description: '召回训练平均分达到4分',
  },
  {
    id: 'goal-3',
    petId: 'pet-2',
    goalType: 'frequency',
    targetValue: 3,
    currentValue: 0,
    description: '本周互动训练3次',
  },
];

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: mockPets,
      currentPetId: mockPets[0]?.id || '',
      weightRecords: mockWeightRecords,
      vaccineRecords: mockVaccineRecords,
      dewormRecords: mockDewormRecords,
      trainingGoals: mockTrainingGoals,
      familyMembers: mockFamilyMembers,
      currentMemberId: 'member-1',

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
          const newWeightRecords = state.weightRecords.filter((r) => r.petId !== id);
          const newVaccineRecords = state.vaccineRecords.filter((r) => r.petId !== id);
          const newDewormRecords = state.dewormRecords.filter((r) => r.petId !== id);
          const newGoals = state.trainingGoals.filter((g) => g.petId !== id);
          return {
            pets: newPets,
            weightRecords: newWeightRecords,
            vaccineRecords: newVaccineRecords,
            dewormRecords: newDewormRecords,
            trainingGoals: newGoals,
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

      addTrainingGoal: (goal) => {
        const newGoal: TrainingGoal = {
          ...goal,
          id: generateId(),
          currentValue: 0,
        };
        set((state) => ({
          trainingGoals: [...state.trainingGoals, newGoal],
        }));
      },

      updateTrainingGoal: (id, updates) => {
        set((state) => ({
          trainingGoals: state.trainingGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      deleteTrainingGoal: (id) => {
        set((state) => ({
          trainingGoals: state.trainingGoals.filter((g) => g.id !== id),
        }));
      },

      getGoalsForPet: (petId) => {
        return get().trainingGoals.filter((g) => g.petId === petId);
      },

      addFamilyMember: (member) => {
        const newMember: FamilyMember = {
          ...member,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          familyMembers: [...state.familyMembers, newMember],
        }));
      },

      updateFamilyMember: (id, updates) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteFamilyMember: (id) => {
        set((state) => ({
          familyMembers: state.familyMembers.filter((m) => m.id !== id),
        }));
      },

      setCurrentMember: (id) => set({ currentMemberId: id }),

      getCurrentMember: () => {
        const { familyMembers, currentMemberId } = get();
        return familyMembers.find((m) => m.id === currentMemberId);
      },

      getMemberById: (id) => {
        return get().familyMembers.find((m) => m.id === id);
      },
    }),
    {
      name: 'pet-training-pet-store',
    }
  )
);
