import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainingCourse, TrainingRecord, RewardLog, BehaviorNote } from '../types';
import { mockCourses, mockRecords, mockCategories } from '../data/mockData';

interface TrainingStore {
  courses: TrainingCourse[];
  categories: typeof mockCategories;
  records: TrainingRecord[];
  activeCategory: string;
  
  setActiveCategory: (category: string) => void;
  getCourseById: (id: string) => TrainingCourse | undefined;
  
  addRecord: (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => void;
  getRecordsForPet: (petId: string) => TrainingRecord[];
  getRecordsForPetByDate: (petId: string, date: string) => TrainingRecord[];
  getRecordById: (id: string) => TrainingRecord | undefined;
  updateRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  deleteRecord: (id: string) => void;
  
  getWeeklyStats: (petId: string) => {
    totalTrainings: number;
    totalDuration: number;
    averageRating: number;
    streak: number;
    completionRate: number;
  };
  
  addReward: (recordId: string, reward: Omit<RewardLog, 'id'>) => void;
  addBehaviorNote: (recordId: string, note: Omit<BehaviorNote, 'id'>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      categories: mockCategories,
      records: mockRecords,
      activeCategory: 'all',

      setActiveCategory: (category) => set({ activeCategory: category }),

      getCourseById: (id) => {
        return get().courses.find((c) => c.id === id);
      },

      addRecord: (record) => {
        const newRecord: TrainingRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
          rewards: record.rewards?.map(r => ({
            ...r,
            id: r.id || generateId(),
          })) || [],
          behaviorNotes: record.behaviorNotes?.map(b => ({
            ...b,
            id: b.id || generateId(),
          })) || [],
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
        return newRecord;
      },

      getRecordsForPet: (petId) => {
        return get().records
          .filter((r) => r.petId === petId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getRecordsForPetByDate: (petId, date) => {
        return get().records.filter(
          (r) => r.petId === petId && r.date === date
        );
      },

      getRecordById: (id) => {
        return get().records.find((r) => r.id === id);
      },

      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      getWeeklyStats: (petId) => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const records = get().records.filter((r) => {
          const recordDate = new Date(r.date);
          return r.petId === petId && recordDate >= weekStart;
        });

        const totalTrainings = records.length;
        const totalDuration = records.reduce(
          (sum, r) => sum + r.durationSeconds,
          0
        );
        const averageRating = records.length > 0
          ? records.reduce((sum, r) => sum + r.rating, 0) / records.length
          : 0;

        const trainingDays = new Set(records.map((r) => r.date)).size;
        const completionRate = Math.min(100, Math.round((trainingDays / 7) * 100));

        let streak = 0;
        const checkDate = new Date(today);
        checkDate.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 30; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasTraining = records.some((r) => r.date === dateStr);
          if (hasTraining) {
            streak++;
          } else if (i > 0) {
            break;
          }
          checkDate.setDate(checkDate.getDate() - 1);
        }

        return {
          totalTrainings,
          totalDuration,
          averageRating: Math.round(averageRating * 10) / 10,
          streak,
          completionRate,
        };
      },

      addReward: (recordId, reward) => {
        const newReward: RewardLog = {
          ...reward,
          id: generateId(),
        };
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, rewards: [...r.rewards, newReward] }
              : r
          ),
        }));
      },

      addBehaviorNote: (recordId, note) => {
        const newNote: BehaviorNote = {
          ...note,
          id: generateId(),
        };
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, behaviorNotes: [...r.behaviorNotes, newNote] }
              : r
          ),
        }));
      },
    }),
    {
      name: 'pet-training-training-store',
    }
  )
);
