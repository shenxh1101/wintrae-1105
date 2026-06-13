import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainingCourse, TrainingRecord, RewardLog, BehaviorNote, PhotoRecord, TrainingGoal } from '../types';
import { mockCourses, mockRecords, mockCategories } from '../data/mockData';
import { usePetStore } from './usePetStore';

interface SuggestionItem {
  icon: string;
  title: string;
  content: string;
  type: 'improvement' | 'focus' | 'praise' | 'tip';
}

interface MemberWeeklyStat {
  memberId: string;
  memberName: string;
  memberColor: string;
  totalTrainings: number;
  totalDuration: number;
  averageRating: number;
}

interface WeekTrendItem {
  weekLabel: string;
  weekStart: Date;
  totalTrainings: number;
  avgRating: number;
  abnormalCount: number;
}

interface PhotoAlbumRecord {
  recordId: string;
  date: string;
  rating: number;
  completedBy?: string;
  photos: PhotoRecord[];
}

interface PhotoAlbumGroup {
  courseId: string;
  courseTitle: string;
  trainingCount: number;
  earliestDate: string;
  latestDate: string;
  records: PhotoAlbumRecord[];
}

interface CourseDoneStat {
  courseId: string;
  courseTitle: string;
  count: number;
}

interface MemberDetailStats {
  total: {
    totalTrainings: number;
    totalDuration: number;
    avgRating: number;
    rewardsCount: number;
    abnormalBehaviorCount: number;
  };
  thisWeek: {
    totalTrainings: number;
    totalDuration: number;
    avgRating: number;
  };
  topCourses: CourseDoneStat[];
  suggestedToHelp: string[];
}

interface TrainingStore {
  courses: TrainingCourse[];
  categories: typeof mockCategories;
  records: TrainingRecord[];
  activeCategory: string;
  
  setActiveCategory: (category: string) => void;
  getCourseById: (id: string) => TrainingCourse | undefined;
  
  addRecord: (record: Omit<TrainingRecord, 'id' | 'createdAt'>) => TrainingRecord;
  getRecordsForPet: (petId: string) => TrainingRecord[];
  getRecordsForPetByDate: (petId: string, date: string) => TrainingRecord[];
  getRecordById: (id: string) => TrainingRecord | undefined;
  updateRecord: (id: string, updates: Partial<TrainingRecord>) => void;
  deleteRecord: (id: string) => void;
  deleteRecordsForPet: (petId: string) => void;
  
  addPhoto: (recordId: string, photo: Omit<PhotoRecord, 'id'>) => void;
  
  getWeeklyRecords: (petId: string, offsetWeeks?: number) => TrainingRecord[];
  getWeeklyStats: (petId: string, weekOffset?: number) => {
    totalTrainings: number;
    totalDuration: number;
    averageRating: number;
    streak: number;
    completionRate: number;
  };
  
  getWeeklySuggestions: (petId: string, weekOffset?: number) => SuggestionItem[];
  getNextWeekPlan: (petId: string, weekOffset?: number) => string[];
  
  calculateGoalProgress: (petId: string, goal: TrainingGoal, weekOffset?: number) => number;
  getMemberWeeklyStats: (petId: string, weekOffset?: number) => MemberWeeklyStat[];
  getFourWeekTrend: (petId: string) => WeekTrendItem[];
  getPhotoAlbum: (petId: string) => PhotoAlbumGroup[];
  getMemberDetailStats: (petId: string, memberId: string) => MemberDetailStats;
  
  addReward: (recordId: string, reward: Omit<RewardLog, 'id'>) => void;
  addBehaviorNote: (recordId: string, note: Omit<BehaviorNote, 'id'>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set, get) => ({
      courses: mockCourses,
      categories: mockCategories,
      records: mockRecords.map(r => ({ ...r, photos: [] })),
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
          photos: record.photos || [],
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

      deleteRecordsForPet: (petId) => {
        set((state) => ({
          records: state.records.filter((r) => r.petId !== petId),
        }));
      },

      addPhoto: (recordId, photo) => {
        const newPhoto: PhotoRecord = {
          ...photo,
          id: generateId(),
        };
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, photos: [...r.photos, newPhoto] }
              : r
          ),
        }));
      },

      getWeeklyRecords: (petId, offsetWeeks = 0) => {
        const today = new Date();
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + diffToMonday - offsetWeeks * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return get().records.filter((r) => {
          const recordDate = new Date(r.date);
          return r.petId === petId && recordDate >= weekStart && recordDate <= weekEnd;
        });
      },

      getWeeklyStats: (petId, weekOffset = 0) => {
        const { getWeeklyRecords } = get();
        const records = getWeeklyRecords(petId, weekOffset);

        const today = new Date();
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + diffToMonday - weekOffset * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

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
        const checkDate = new Date(weekEnd);
        checkDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasTraining = get().records.some((r) => r.petId === petId && r.date === dateStr);
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

      getWeeklySuggestions: (petId, weekOffset = 0) => {
        const suggestions: SuggestionItem[] = [];
        const { courses, getWeeklyStats, getWeeklyRecords } = get();
        const stats = getWeeklyStats(petId, weekOffset);
        const records = getWeeklyRecords(petId, weekOffset);

        if (stats.totalTrainings === 0) {
          suggestions.push({
            icon: 'Target',
            title: '开启训练之旅',
            content: '本周还没有训练记录，选一门简单的课程开始吧！每天坚持5-10分钟效果最好。',
            type: 'tip',
          });
          suggestions.push({
            icon: 'Lightbulb',
            title: '推荐从基础开始',
            content: '建议从「定点排便」或「坐下训练」开始，这些是最基础也最重要的技能。',
            type: 'focus',
          });
          return suggestions;
        }

        if (stats.totalTrainings > 0 && stats.totalTrainings < 3) {
          suggestions.push({
            icon: 'TrendingUp',
            title: '增加训练频率',
            content: `本周训练了${stats.totalTrainings}次，建议提升到每周5次左右。固定时间训练效果更好！`,
            type: 'improvement',
          });
        }

        if (stats.totalTrainings >= 5) {
          suggestions.push({
            icon: 'Award',
            title: '太棒了，继续保持！',
            content: `本周训练了${stats.totalTrainings}次，非常棒的坚持！继续保持这个频率。`,
            type: 'praise',
          });
        }

        if (stats.averageRating >= 4.5) {
          suggestions.push({
            icon: 'Trophy',
            title: '训练效果优秀',
            content: `平均评分${stats.averageRating}分，训练效果很好！可以尝试更有挑战性的课程了。`,
            type: 'praise',
          });
        }

        if (stats.averageRating > 0 && stats.averageRating < 3.5) {
          suggestions.push({
            icon: 'Target',
            title: '重点提升训练质量',
            content: `目前平均评分${stats.averageRating}分，建议放慢节奏，确保每一步宠物都真正理解。`,
            type: 'improvement',
          });
        }

        const abnormalBehaviors = records
          .filter(r => r.behaviorNotes && r.behaviorNotes.some(b => b.isAbnormal))
          .slice(0, 3);
        
        if (abnormalBehaviors.length > 0) {
          const behaviors = [...new Set(abnormalBehaviors.flatMap(r => r.behaviorNotes.filter(b => b.isAbnormal).map(b => b.behavior)))];
          suggestions.push({
            icon: 'AlertTriangle',
            title: `注意异常行为：${behaviors.join('、')}`,
            content: '训练中出现异常行为时，可以缩短训练时间，用更高价值的零食奖励，或暂停训练让宠物休息。',
            type: 'focus',
          });
        }

        if (stats.streak >= 3) {
          suggestions.push({
            icon: 'Flame',
            title: `${stats.streak}天连续打卡！`,
            content: `已经连续训练${stats.streak}天了，习惯正在养成！宠物一定感受到了你的用心。`,
            type: 'praise',
          });
        }

        const lowScoreCourses: Record<string, { total: number; count: number }> = {};
        records.forEach(r => {
          if (r.rating < 4) {
            if (!lowScoreCourses[r.courseId]) {
              lowScoreCourses[r.courseId] = { total: 0, count: 0 };
            }
            lowScoreCourses[r.courseId].total += r.rating;
            lowScoreCourses[r.courseId].count++;
          }
        });

        const weakCourseId = Object.entries(lowScoreCourses)
          .sort((a, b) => (a[1].total / a[1].count) - (b[1].total / b[1].count))[0]?.[0];

        if (weakCourseId) {
          const weakCourse = courses.find(c => c.id === weakCourseId);
          if (weakCourse) {
            suggestions.push({
              icon: 'RefreshCw',
              title: `多练习「${weakCourse.title}」`,
              content: `这门课程的评分偏低，建议每天花5分钟专项练习，可以分成多个短时段进行。`,
              type: 'focus',
            });
          }
        }

        suggestions.push({
          icon: 'Clock',
          title: '训练时长提示',
          content: '幼犬每次训练建议5-10分钟，成犬不超过15分钟。短而频繁比长而少有效果。',
          type: 'tip',
        });

        return suggestions.slice(0, 5);
      },

      getNextWeekPlan: (petId, weekOffset = 0) => {
        const plans: string[] = [];
        const { getWeeklyStats, getWeeklyRecords, courses } = get();
        const stats = getWeeklyStats(petId, weekOffset);
        const weeklyRecords = getWeeklyRecords(petId, weekOffset);
        const allRecords = get().records.filter(r => r.petId === petId);

        if (stats.totalTrainings < 3) {
          plans.push('每日基础训练10分钟，保持频率比单次时长更重要');
        } else {
          plans.push(`保持每周${stats.totalTrainings >= 5 ? stats.totalTrainings : 5}次的训练频率`);
        }

        const trainedCourseIds = new Set(allRecords.slice(0, 10).map(r => r.courseId));
        const untrained = courses.filter(c => !trainedCourseIds.has(c.id) && c.difficulty === 'easy');
        
        if (untrained.length > 0) {
          plans.push(`新增课程：${untrained[0].title}，循序渐进开始学习`);
        }

        const weakCourses = weeklyRecords
          .filter(r => r.rating < 4)
          .map(r => r.courseId);
        
        if (weakCourses.length > 0) {
          const weakCourse = courses.find(c => c.id === weakCourses[0]);
          if (weakCourse) {
            plans.push(`重点复习：${weakCourse.title}，这门还需要多加练习`);
          }
        }

        plans.push('周末记录一次体重，监测健康状况');
        plans.push('检查疫苗和驱虫是否在有效期内');

        return plans;
      },

      calculateGoalProgress: (petId, goal, weekOffset = 0) => {
        const { getWeeklyRecords } = get();
        const weeklyRecords = getWeeklyRecords(petId, weekOffset);

        switch (goal.goalType) {
          case 'frequency':
            return weeklyRecords.length;

          case 'duration':
            return weeklyRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

          case 'mastery':
            if (goal.courseId) {
              const courseRecords = weeklyRecords.filter(r => r.courseId === goal.courseId);
              if (courseRecords.length === 0) return 0;
              const avg = courseRecords.reduce((sum, r) => sum + r.rating, 0) / courseRecords.length;
              return Math.round(avg * 10) / 10;
            } else {
              if (weeklyRecords.length === 0) return 0;
              const avg = weeklyRecords.reduce((sum, r) => sum + r.rating, 0) / weeklyRecords.length;
              return Math.round(avg * 10) / 10;
            }

          default:
            return 0;
        }
      },

      getMemberWeeklyStats: (petId, weekOffset = 0) => {
        const { getWeeklyRecords } = get();
        const weeklyRecords = getWeeklyRecords(petId, weekOffset);
        const petStore = usePetStore.getState();
        const members = petStore.familyMembers;

        const memberStats: Record<string, { totalTrainings: number; totalDuration: number; totalRating: number; ratingCount: number }> = {};

        members.forEach(m => {
          memberStats[m.id] = { totalTrainings: 0, totalDuration: 0, totalRating: 0, ratingCount: 0 };
        });

        weeklyRecords.forEach(r => {
          const memberId = r.completedBy || petStore.currentMemberId;
          if (!memberStats[memberId]) {
            const member = members.find(m => m.id === memberId);
            if (member) {
              memberStats[memberId] = { totalTrainings: 0, totalDuration: 0, totalRating: 0, ratingCount: 0 };
            } else {
              return;
            }
          }
          memberStats[memberId].totalTrainings++;
          memberStats[memberId].totalDuration += r.durationSeconds;
          memberStats[memberId].totalRating += r.rating;
          memberStats[memberId].ratingCount++;
        });

        return members.map(m => ({
          memberId: m.id,
          memberName: m.name,
          memberColor: m.color,
          totalTrainings: memberStats[m.id]?.totalTrainings || 0,
          totalDuration: memberStats[m.id]?.totalDuration || 0,
          averageRating: memberStats[m.id]?.ratingCount > 0
            ? Math.round((memberStats[m.id].totalRating / memberStats[m.id].ratingCount) * 10) / 10
            : 0,
        }));
      },

      getFourWeekTrend: (petId) => {
        const { getWeeklyRecords } = get();
        const result: WeekTrendItem[] = [];
        const weekLabels = ['本周', '上周', '前周', '4周前'];

        const today = new Date();
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        for (let i = 0; i < 4; i++) {
          const records = getWeeklyRecords(petId, i);
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() + diffToMonday - i * 7);
          weekStart.setHours(0, 0, 0, 0);

          const totalTrainings = records.length;
          const avgRating = records.length > 0
            ? Math.round((records.reduce((sum, r) => sum + r.rating, 0) / records.length) * 10) / 10
            : 0;

          const abnormalCount = records.filter(r =>
            r.behaviorNotes && r.behaviorNotes.some(b => b.isAbnormal)
          ).length;

          result.push({
            weekLabel: weekLabels[i],
            weekStart,
            totalTrainings,
            avgRating,
            abnormalCount,
          });
        }

        return result;
      },

      getPhotoAlbum: (petId) => {
        const { records, courses, getCourseById } = get();
        const petRecords = records.filter(r => r.petId === petId && r.photos && r.photos.length > 0);

        const courseGroups: Record<string, PhotoAlbumRecord[]> = {};

        petRecords.forEach(record => {
          if (!courseGroups[record.courseId]) {
            courseGroups[record.courseId] = [];
          }
          courseGroups[record.courseId].push({
            recordId: record.id,
            date: record.date,
            rating: record.rating,
            completedBy: record.completedBy,
            photos: record.photos,
          });
        });

        const result: PhotoAlbumGroup[] = Object.entries(courseGroups).map(([courseId, courseRecords]) => {
          const course = getCourseById(courseId);
          const sortedRecords = courseRecords.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          return {
            courseId,
            courseTitle: course?.title || '未知课程',
            trainingCount: sortedRecords.length,
            earliestDate: sortedRecords[0]?.date || '',
            latestDate: sortedRecords[sortedRecords.length - 1]?.date || '',
            records: sortedRecords,
          };
        });

        return result.sort((a, b) => 
          new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
        );
      },

      getMemberDetailStats: (petId, memberId) => {
        const { records, getWeeklyRecords, courses, getCourseById } = get();
        const petStore = usePetStore.getState();

        const allPetRecords = records.filter(r => r.petId === petId);
        const memberAllRecords = allPetRecords.filter(r =>
          (r.completedBy || petStore.currentMemberId) === memberId
        );

        const thisWeekRecords = getWeeklyRecords(petId, 0).filter(r =>
          (r.completedBy || petStore.currentMemberId) === memberId
        );

        const totalTrainings = memberAllRecords.length;
        const totalDuration = memberAllRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
        const avgRating = memberAllRecords.length > 0
          ? Math.round((memberAllRecords.reduce((sum, r) => sum + r.rating, 0) / memberAllRecords.length) * 10) / 10
          : 0;

        const rewardsCount = memberAllRecords.reduce((sum, r) =>
          sum + (r.rewards?.reduce((s, reward) => s + reward.count, 0) || 0), 0
        );

        const abnormalBehaviorCount = memberAllRecords.reduce((sum, r) =>
          sum + (r.behaviorNotes?.filter(b => b.isAbnormal).length || 0), 0
        );

        const thisWeekTotalTrainings = thisWeekRecords.length;
        const thisWeekTotalDuration = thisWeekRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
        const thisWeekAvgRating = thisWeekRecords.length > 0
          ? Math.round((thisWeekRecords.reduce((sum, r) => sum + r.rating, 0) / thisWeekRecords.length) * 10) / 10
          : 0;

        const courseCountMap: Record<string, number> = {};
        memberAllRecords.forEach(r => {
          courseCountMap[r.courseId] = (courseCountMap[r.courseId] || 0) + 1;
        });

        const topCourses: CourseDoneStat[] = Object.entries(courseCountMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([courseId, count]) => ({
            courseId,
            courseTitle: getCourseById(courseId)?.title || '未知课程',
            count,
          }));

        const suggestedToHelp: string[] = [];
        const thisWeekAllRecords = getWeeklyRecords(petId, 0);
        const thisWeekCourseCount: Record<string, number> = {};
        thisWeekAllRecords.forEach(r => {
          thisWeekCourseCount[r.courseId] = (thisWeekCourseCount[r.courseId] || 0) + 1;
        });

        const memberThisWeekCourses = new Set(thisWeekRecords.map(r => r.courseId));
        Object.entries(thisWeekCourseCount).forEach(([courseId, count]) => {
          if (!memberThisWeekCourses.has(courseId) && count < 3) {
            const course = getCourseById(courseId);
            if (course) {
              suggestedToHelp.push(`${course.title}（本周已练${count}次，可协助补练）`);
            }
          }
        });

        if (suggestedToHelp.length === 0) {
          suggestedToHelp.push('本周各项训练进展顺利，继续保持！');
        }

        return {
          total: {
            totalTrainings,
            totalDuration,
            avgRating,
            rewardsCount,
            abnormalBehaviorCount,
          },
          thisWeek: {
            totalTrainings: thisWeekTotalTrainings,
            totalDuration: thisWeekTotalDuration,
            avgRating: thisWeekAvgRating,
          },
          topCourses,
          suggestedToHelp,
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
