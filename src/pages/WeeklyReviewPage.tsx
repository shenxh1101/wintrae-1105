import { useNavigate } from 'react-router-dom';
import { 
  Trophy, TrendingUp, Target, Flame, Clock, Star, 
  ChevronLeft, ChevronRight, Lightbulb, Calendar, Award,
  AlertTriangle, RefreshCw, Users
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  Trophy,
  AlertTriangle,
  Flame,
  RefreshCw,
  Clock,
  Calendar,
  Star,
};

const goalIconMap: Record<string, any> = {
  frequency: Calendar,
  duration: Clock,
  mastery: Award,
};

const WeeklyReviewPage = () => {
  const navigate = useNavigate();
  const { getCurrentPet, getGoalsForPet, getMemberById, familyMembers } = usePetStore();
  const { courses, getRecordsForPet, getWeeklyStats, getWeeklySuggestions, getNextWeekPlan, getMemberWeeklyStats, calculateGoalProgress } = useTrainingStore();
  
  const currentPet = getCurrentPet();
  const petId = currentPet?.id || '';
  const weeklyStats = currentPet ? getWeeklyStats(currentPet.id) : null;
  const records = currentPet ? getRecordsForPet(currentPet.id) : [];
  const suggestions = currentPet ? getWeeklySuggestions(currentPet.id) : [];
  const nextWeekPlan = currentPet ? getNextWeekPlan(currentPet.id) : [];
  const goals = currentPet ? getGoalsForPet(currentPet.id) : [];
  const memberWeeklyStats = currentPet ? getMemberWeeklyStats(currentPet.id) : [];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const score = weeklyStats ? Math.min(100, Math.round(
    (weeklyStats.completionRate * 0.3) +
    (weeklyStats.streak * 5 * 0.3) +
    (weeklyStats.averageRating * 15 * 0.4)
  )) : 0;

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { text: '优秀', color: 'text-green-500', bg: 'bg-green-100' };
    if (score >= 75) return { text: '良好', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (score >= 60) return { text: '及格', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { text: '继续加油', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const scoreLevel = getScoreLevel(score);

  const courseStats = () => {
    const courseCount: Record<string, number> = {};
    records.forEach(r => {
      courseCount[r.courseId] = (courseCount[r.courseId] || 0) + 1;
    });
    
    return Object.entries(courseCount)
      .map(([courseId, count]) => {
        const course = courses.find(c => c.id === courseId);
        return { course, count };
      })
      .filter(item => item.course)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const topCourses = courseStats();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}小时${remainMins > 0 ? remainMins + '分' : ''}`;
    }
    return `${mins}分钟`;
  };

  const getGoalColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getGoalUnit = (goalType: string) => {
    switch (goalType) {
      case 'frequency':
        return '次';
      case 'duration':
        return '分钟';
      case 'mastery':
        return '分';
      default:
        return '';
    }
  };

  const memberStatsWithInfo = memberWeeklyStats.map(stat => {
    const member = stat.memberId !== 'unknown' ? getMemberById(stat.memberId) : undefined;
    return {
      ...stat,
      memberName: member?.name || stat.memberName || '未指定',
      memberColor: member?.color || stat.memberColor || '#9CA3AF',
      memberRole: member?.role || 'viewer',
    };
  });

  const maxTrainings = memberStatsWithInfo.length > 0
    ? Math.max(...memberStatsWithInfo.map(m => m.totalTrainings))
    : 0;

  const formatMemberDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}小时${remainMins > 0 ? remainMins + '分' : ''}`;
    }
    return `${mins}分钟`;
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return '主人';
      case 'trainer': return '训练师';
      case 'viewer': return '家庭成员';
      default: return '成员';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 via-primary-400 to-primary-300">
      <div className="text-white safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">每周复盘</h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-center gap-4 py-2">
          <button className="p-1">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-bold">
              {format(weekStart, 'M月d日', { locale: zhCN })} - {format(weekEnd, 'M月d日', { locale: zhCN })}
            </p>
            <p className="text-sm text-white/70">本周训练总结</p>
          </div>
          <button className="p-1 opacity-40">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-float text-center"
        >
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="12"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${score * 3.52} 352`}
                initial={{ strokeDasharray: '0 352' }}
                animate={{ strokeDasharray: `${score * 3.52} 352` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF8C42" />
                  <stop offset="100%" stopColor="#FFB347" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-4xl font-bold text-neutral-800"
              >
                {score}
              </motion.span>
              <span className="text-sm text-neutral-500">综合评分</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${scoreLevel.bg}`}>
            <Trophy size={16} className={scoreLevel.color} />
            <span className={`font-medium ${scoreLevel.color}`}>{scoreLevel.text}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2 mt-6"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 text-center">
            <div className="w-8 h-8 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-1">
              <Target size={16} className="text-primary-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{weeklyStats?.totalTrainings || 0}</p>
            <p className="text-xs text-neutral-500">训练次数</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 text-center">
            <div className="w-8 h-8 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-1">
              <Clock size={16} className="text-green-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">
              {weeklyStats ? Math.round(weeklyStats.totalDuration / 60) : 0}
            </p>
            <p className="text-xs text-neutral-500">总分钟</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 text-center">
            <div className="w-8 h-8 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-1">
              <Flame size={16} className="text-yellow-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{weeklyStats?.streak || 0}</p>
            <p className="text-xs text-neutral-500">连续打卡</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 text-center">
            <div className="w-8 h-8 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-1">
              <Star size={16} className="text-blue-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{weeklyStats?.averageRating || 0}</p>
            <p className="text-xs text-neutral-500">平均评分</p>
          </div>
        </motion.div>

        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-5 mt-6 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4">训练目标完成情况</h3>
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const currentValue = calculateGoalProgress(currentPet.id, goal);
                const progress = Math.min(100, Math.round((currentValue / Math.max(1, goal.targetValue)) * 100));
                const GoalIcon = goalIconMap[goal.goalType] || Target;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.1 }}
                    className="bg-neutral-50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        progress >= 100 ? 'bg-green-100 text-green-500' :
                        progress >= 60 ? 'bg-blue-100 text-blue-500' :
                        progress >= 30 ? 'bg-yellow-100 text-yellow-500' :
                        'bg-orange-100 text-orange-500'
                      }`}>
                        <GoalIcon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">{goal.description}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {currentValue} / {goal.targetValue} {getGoalUnit(goal.goalType)}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${
                        progress >= 100 ? 'text-green-500' :
                        progress >= 60 ? 'text-blue-500' :
                        progress >= 30 ? 'text-yellow-500' :
                        'text-orange-500'
                      }`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + index * 0.1 }}
                        className={`h-full rounded-full ${getGoalColor(progress)}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {topCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 mt-6 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4">本周训练TOP3</h3>
            <div className="space-y-3">
              {topCourses.map((item, index) => (
                <div key={item.course?.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                    index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-neutral-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{item.course?.title}</p>
                    <p className="text-xs text-neutral-500">{item.count}次训练</p>
                  </div>
                  <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(item.count / topCourses[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {memberStatsWithInfo.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-5 mt-6 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4">🏆 家庭成员本周贡献</h3>
            <div className="space-y-4">
              {memberStatsWithInfo.map((member, index) => {
                const progress = maxTrainings > 0
                  ? Math.round((member.totalTrainings / maxTrainings) * 100)
                  : 0;
                return (
                  <motion.div
                    key={member.memberId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.1 }}
                    className="bg-neutral-50 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: member.memberColor }}
                      >
                        {member.memberName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-neutral-800">{member.memberName}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                            {getRoleText(member.memberRole)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 + index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: member.memberColor }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-2 text-center">
                        <p className="text-lg font-bold" style={{ color: member.memberColor }}>
                          {member.totalTrainings}
                        </p>
                        <p className="text-xs text-neutral-500">训练次数</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 text-center">
                        <p className="text-lg font-bold text-neutral-700">
                          {formatMemberDuration(member.totalDuration)}
                        </p>
                        <p className="text-xs text-neutral-500">总时长</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 text-center">
                        <p className="text-lg font-bold text-yellow-500">
                          {member.averageRating}
                        </p>
                        <p className="text-xs text-neutral-500">平均评分</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-5 mt-6 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4">🏆 家庭成员本周贡献</h3>
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                <Users size={28} className="text-neutral-300" />
              </div>
              <p className="text-neutral-500 mb-1">还没有成员完成训练</p>
              <p className="text-neutral-400 text-sm">邀请家人一起参与宠物训练吧</p>
            </div>
          </motion.div>
        )}

        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h3 className="font-bold text-white text-lg mb-3">训练建议</h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const Icon = iconMap[suggestion.icon] || Lightbulb;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/90 backdrop-blur rounded-2xl p-4 flex gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      suggestion.type === 'praise' ? 'bg-green-100 text-green-500' :
                      suggestion.type === 'improvement' ? 'bg-orange-100 text-orange-500' :
                      suggestion.type === 'focus' ? 'bg-blue-100 text-blue-500' :
                      'bg-purple-100 text-purple-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">{suggestion.title}</h4>
                      <p className="text-sm text-neutral-600 mt-1">{suggestion.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {nextWeekPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 mb-8"
          >
            <h3 className="font-bold text-white text-lg mb-3">下周计划</h3>
            <div className="bg-white/90 backdrop-blur rounded-2xl p-5">
              <ul className="space-y-3">
                {nextWeekPlan.map((plan, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-secondary-600">{index + 1}</span>
                    </div>
                    <p className="text-neutral-700">{plan}</p>
                  </li>
                ))}
              </ul>
              
              <button className="w-full mt-5 py-3 bg-primary-500 text-white rounded-xl font-medium active:scale-95 transition-transform">
                开始新一周训练
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReviewPage;
