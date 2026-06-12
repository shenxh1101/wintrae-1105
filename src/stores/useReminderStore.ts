import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reminder } from '../types';
import { mockReminders } from '../data/mockData';

interface ReminderStore {
  reminders: Reminder[];
  
  getRemindersForPet: (petId: string) => Reminder[];
  getAllReminders: () => Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  deleteRemindersForPet: (petId: string) => void;
  toggleReminder: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: mockReminders,

      getRemindersForPet: (petId) => {
        return get().reminders
          .filter((r) => r.petId === petId)
          .sort((a, b) => a.time.localeCompare(b.time));
      },

      getAllReminders: () => {
        return [...get().reminders].sort((a, b) => a.time.localeCompare(b.time));
      },

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: generateId(),
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },

      deleteRemindersForPet: (petId) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.petId !== petId),
        }));
      },

      toggleReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        }));
      },
    }),
    {
      name: 'pet-training-reminder-store',
    }
  )
);
