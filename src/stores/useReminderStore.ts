import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reminder } from '../types';
import { mockReminders } from '../data/mockData';
import { usePetStore } from './usePetStore';
import { useTrainingStore } from './useTrainingStore';
import { differenceInDays, parseISO } from 'date-fns';

export interface HealthTodo {
  id: string;
  type: 'vaccine' | 'deworm' | 'weight' | 'goal';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ReminderStore {
  reminders: Reminder[];
  
  getRemindersForPet: (petId: string) => Reminder[];
  getAllReminders: () => Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  deleteRemindersForPet: (petId: string) => void;
  toggleReminder: (id: string) => void;
  getHealthTodos: (petId: string) => HealthTodo[];
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

      getHealthTodos: (petId) => {
        const todos: HealthTodo[] = [];
        const today = new Date();
        const petStore = usePetStore.getState();
        const trainingStore = useTrainingStore.getState();

        const vaccineRecords = petStore.getVaccineRecordsForPet(petId);
        vaccineRecords.forEach((record) => {
          if (!record.nextDate) return;
          const nextDate = parseISO(record.nextDate);
          const daysLeft = differenceInDays(nextDate, today);

          if (daysLeft <= 30) {
            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (daysLeft < 0) {
              priority = 'high';
            } else if (daysLeft <= 7) {
              priority = 'high';
            } else if (daysLeft <= 15) {
              priority = 'medium';
            } else {
              priority = 'low';
            }

            todos.push({
              id: `vaccine-${record.id}`,
              type: 'vaccine',
              title: `${record.name} 接种`,
              description: daysLeft < 0
                ? `已过期 ${Math.abs(daysLeft)} 天，请尽快接种`
                : `还有 ${daysLeft} 天到期`,
              dueDate: record.nextDate,
              priority,
            });
          }
        });

        const dewormRecords = petStore.getDewormRecordsForPet(petId);
        dewormRecords.forEach((record) => {
          if (!record.nextDate) return;
          const nextDate = parseISO(record.nextDate);
          const daysLeft = differenceInDays(nextDate, today);

          if (daysLeft <= 7) {
            const typeLabel = record.type === 'internal' ? '体内驱虫' : '体外驱虫';
            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (daysLeft < 0) {
              priority = 'high';
            } else if (daysLeft <= 3) {
              priority = 'high';
            } else {
              priority = 'medium';
            }

            todos.push({
              id: `deworm-${record.id}`,
              type: 'deworm',
              title: typeLabel,
              description: daysLeft < 0
                ? `已过期 ${Math.abs(daysLeft)} 天，请尽快安排`
                : `还有 ${daysLeft} 天到期`,
              dueDate: record.nextDate,
              priority,
            });
          }
        });

        const weightRecords = petStore.getWeightRecordsForPet(petId);
        if (weightRecords.length > 0) {
          const lastWeight = weightRecords[weightRecords.length - 1];
          const lastDate = parseISO(lastWeight.date);
          const daysSince = differenceInDays(today, lastDate);

          if (daysSince > 30) {
            todos.push({
              id: `weight-${petId}`,
              type: 'weight',
              title: '记录体重',
              description: `已经 ${daysSince} 天没记录体重了`,
              priority: daysSince > 60 ? 'high' : 'medium',
            });
          }
        } else {
          todos.push({
            id: `weight-${petId}`,
            type: 'weight',
            title: '记录体重',
            description: '还没有体重记录，去记录一下吧',
            priority: 'medium',
          });
        }

        const goals = petStore.getGoalsForPet(petId);
        goals.forEach((goal) => {
          const currentValue = trainingStore.calculateGoalProgress(petId, goal);
          const progress = Math.min(100, Math.round((currentValue / Math.max(1, goal.targetValue)) * 100));

          if (progress < 100) {
            const remaining = goal.targetValue - currentValue;
            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (progress < 30) {
              priority = 'high';
            } else if (progress < 60) {
              priority = 'medium';
            } else {
              priority = 'low';
            }

            todos.push({
              id: `goal-${goal.id}`,
              type: 'goal',
              title: goal.description,
              description: `还差 ${remaining}${goal.goalType === 'mastery' ? ' 分' : ' 次'}完成目标`,
              priority,
            });
          }
        });

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return todos;
      },
    }),
    {
      name: 'pet-training-reminder-store',
    }
  )
);
