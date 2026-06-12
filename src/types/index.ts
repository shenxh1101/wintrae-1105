export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  ageMonths: number;
  weightKg: number;
  avatar: string;
  gender?: 'male' | 'female';
  createdAt: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMin: number;
  description: string;
  steps: string[];
  tips: string[];
  image: string;
  icon: string;
}

export interface RewardLog {
  id: string;
  type: 'treat' | 'praise' | 'play';
  count: number;
  description?: string;
}

export interface BehaviorNote {
  id: string;
  behavior: string;
  description: string;
  isAbnormal: boolean;
}

export interface PhotoRecord {
  id: string;
  url: string;
  label: 'before' | 'after' | 'progress';
  caption?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'trainer' | 'viewer';
  color: string;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  petId: string;
  courseId: string;
  date: string;
  durationSeconds: number;
  rating: number;
  notes: string;
  photo?: string;
  photos: PhotoRecord[];
  rewards: RewardLog[];
  behaviorNotes: BehaviorNote[];
  completedBy?: string;
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  petId: string;
  date: string;
  weightKg: number;
  note?: string;
}

export interface VaccineRecord {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDate?: string;
  hospital?: string;
  photo?: string;
}

export interface DewormRecord {
  id: string;
  petId: string;
  type: 'internal' | 'external';
  date: string;
  nextDate?: string;
  product?: string;
}

export interface Reminder {
  id: string;
  petId: string;
  type: 'training' | 'vaccine' | 'deworm' | 'custom';
  title: string;
  time: string;
  repeat: 'daily' | 'weekly' | 'monthly' | 'once';
  enabled: boolean;
  relatedId?: string;
  note?: string;
}

export interface TrainingGoal {
  id: string;
  petId: string;
  courseId?: string;
  goalType: 'frequency' | 'duration' | 'mastery';
  targetValue: number;
  currentValue: number;
  deadline?: string;
  description: string;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  totalTrainings: number;
  totalDuration: number;
  completionRate: number;
  averageRating: number;
  streak: number;
  suggestions: string[];
  nextWeekPlan: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
