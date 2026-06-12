import { useNavigate } from 'react-router-dom';
import { 
  Trophy, TrendingUp, Target, Flame, Clock, Star, 
  ChevronLeft, ChevronRight, Lightbulb, Calendar, Award
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import { motion } from 'framer-motion';

const WeeklyReviewPage = () => {
  const navigate = useNavigate();
  const { getCurrentPet } = usePetStore();
  const { courses, getRecordsForPet, getWeeklyStats } = useTrainingStore();
  
  const currentPet = getCurrentPet();
  const weeklyStats = currentPet ? getWeeklyStats(currentPet.id) : null;
  const records = currentPet ? getRecordsForPet(currentPet.id) : [];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const suggestions = [
    {
      icon: Target,
      title: '增加训练频率',
      content: '建议本周增加训练次数，从每周3次提升到5次，保持连续打卡',
      type: 'improvement',
    },
    {
      icon: Lightbulb,
      title: '重点练习召回',
      content: '召回训练表现一般，建议每天练习5-10分钟，使用高价值奖励',
      type: 'focus',
    },
    {
      icon: Award,
      title: '表扬一下',
      content: '定点排便训练进步很大！继续保持，已经养成好习惯了',
      type: 'praise',
    },
    {
      icon: Clock,
      title: '注意休息',
      content: '每次训练不要超过15分钟，保持宠物的兴趣和注意力',
      type: 'tip',
    },
  ];

  const nextWeekPlan = [
    '每日基础训练10分钟（坐、等待、召回）',
    '新增课程：趴下训练',
    '周末进行一次综合复习',
    '记录体重变化',
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 via-primary-400 to-primary-300">
      {/* 顶部 */}
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

        {/* 周选择 */}
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

      {/* 评分卡片 */}
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

        {/* 数据统计 */}
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

        {/* 热门课程 */}
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

        {/* 复盘建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h3 className="font-bold text-white text-lg mb-3">训练建议</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
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

        {/* 下周计划 */}
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
      </div>
    </div>
  );
};

export default WeeklyReviewPage;
