import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Crown, Dumbbell, Eye, Award, Star, Clock,
  Target, TrendingUp, Gift, AlertTriangle, Calendar,
  CheckCircle, ChevronRight, Sparkles, Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import type { TrainingCourse } from '../types';

type MemberRole = 'owner' | 'trainer' | 'viewer';

const roleConfig: Record<MemberRole, { label: string; icon: typeof Crown; color: string; bgColor: string }> = {
  owner: {
    label: '主人',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  trainer: {
    label: '训练师',
    icon: Dumbbell,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  viewer: {
    label: '观察者',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

const rewardTypeConfig: Record<string, { label: string; icon: typeof Gift; color: string; bgColor: string }> = {
  treat: {
    label: '零食奖励',
    icon: Gift,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  praise: {
    label: '表扬鼓励',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  play: {
    label: '玩耍奖励',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
};

const MemberDetailPage = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { getMemberById, setCurrentMember, currentMemberId, getCurrentPet, getGoalsForPet } = usePetStore();
  const { courses, records, getWeeklyRecords, calculateGoalProgress } = useTrainingStore();

  const member = memberId ? getMemberById(memberId) : undefined;
  const currentPet = getCurrentPet();
  const petId = currentPet?.id || '';

  const isCurrent = memberId === currentMemberId;

  const memberRecords = records.filter(r => r.completedBy === memberId && r.petId === petId);
  const weeklyRecords = currentPet ? getWeeklyRecords(currentPet.id).filter(r => r.completedBy === memberId) : [];
  const allWeeklyRecords = currentPet ? getWeeklyRecords(currentPet.id) : [];

  const totalTrainings = memberRecords.length;
  const totalDuration = memberRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
  const averageRating = memberRecords.length > 0
    ? Math.round((memberRecords.reduce((sum, r) => sum + r.rating, 0) / memberRecords.length) * 10) / 10
    : 0;

  const weeklyTrainings = weeklyRecords.length;
  const weeklyContributionPercent = allWeeklyRecords.length > 0
    ? Math.round((weeklyTrainings / allWeeklyRecords.length) * 100)
    : 0;

  const courseStats: { course: TrainingCourse | undefined; count: number; avgRating: number }[] = [];
  const courseCountMap: Record<string, { count: number; totalRating: number }> = {};

  memberRecords.forEach(r => {
    if (!courseCountMap[r.courseId]) {
      courseCountMap[r.courseId] = { count: 0, totalRating: 0 };
    }
    courseCountMap[r.courseId].count++;
    courseCountMap[r.courseId].totalRating += r.rating;
  });

  Object.entries(courseCountMap).forEach(([courseId, data]) => {
    const course = courses.find(c => c.id === courseId);
    courseStats.push({
      course,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
    });
  });

  courseStats.sort((a, b) => b.count - a.count);
  const topCourses = courseStats.slice(0, 5);

  const rewardStats: Record<string, number> = {};
  memberRecords.forEach(r => {
    r.rewards.forEach(reward => {
      rewardStats[reward.type] = (rewardStats[reward.type] || 0) + reward.count;
    });
  });

  const rewardList = Object.entries(rewardStats)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const abnormalCount = memberRecords.reduce((sum, r) => {
    return sum + r.behaviorNotes.filter(b => b.isAbnormal).length;
  }, 0);

  const petGoals = currentPet ? getGoalsForPet(currentPet.id) : [];
  const unfinishedGoals = petGoals.filter(goal => {
    const currentValue = calculateGoalProgress(petId, goal);
    return currentValue < goal.targetValue;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}小时${remainMins > 0 ? remainMins + '分' : ''}`;
    }
    return `${mins}分钟`;
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">成员不存在</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-500 font-medium"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = roleConfig[member.role];
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-neutral-50 pb-8">
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white pt-12 pb-16 px-5 rounded-b-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-lg font-semibold">成员详情</h1>
            <div className="w-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4"
              style={{ backgroundColor: member.color }}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-3xl object-cover"
                />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
              <RoleIcon size={14} />
              {roleInfo.label}
            </span>
            {isCurrent && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                <CheckCircle size={14} />
                当前操作人
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-primary-500" />
            历史累计统计
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">{totalTrainings}</p>
              <p className="text-xs text-neutral-500 mt-1">总训练次数</p>
            </div>
            <div className="text-center p-3 bg-secondary-50 rounded-xl">
              <p className="text-2xl font-bold text-secondary-600">
                {formatDuration(totalDuration)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">总时长</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
              <p className="text-xs text-neutral-500 mt-1">平均评分</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-card"
        >
          <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-secondary-500" />
            本周数据
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm text-neutral-600">本周训练</span>
                <span className="text-sm font-bold text-neutral-800">{weeklyTrainings} 次</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, weeklyTrainings * 20)}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                />
              </div>
            </div>
            <div className="text-center px-4 border-l border-neutral-100">
              <p className="text-2xl font-bold text-primary-500">{weeklyContributionPercent}%</p>
              <p className="text-xs text-neutral-500">贡献占比</p>
            </div>
          </div>
        </motion.div>

        {topCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              完成过的课程 TOP5
            </h3>
            <div className="space-y-3">
              {topCourses.map((item, index) => (
                <motion.div
                  key={item.course?.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-neutral-400' :
                    index === 2 ? 'bg-orange-400' : 'bg-neutral-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate">
                      {item.course?.title || '未知课程'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.count} 次训练
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-neutral-700">{item.avgRating}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {rewardList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Gift size={18} className="text-purple-500" />
              常用奖励
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {rewardList.map((item, index) => {
                const config = rewardTypeConfig[item.type] || rewardTypeConfig.treat;
                const RewardIcon = config.icon;
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className="text-center p-3 rounded-xl"
                    style={{ backgroundColor: config.bgColor + '40' }}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-xl ${config.bgColor} flex items-center justify-center mb-2`}>
                      <RewardIcon size={20} className={config.color} />
                    </div>
                    <p className="text-xl font-bold text-neutral-800">{item.count}</p>
                    <p className="text-xs text-neutral-500 mt-1">{config.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {abnormalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 mb-1">异常行为记录</h3>
                <p className="text-sm text-neutral-600">
                  该成员的训练记录中出现了 <span className="font-bold text-orange-500">{abnormalCount}</span> 次异常行为
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  建议关注宠物状态，必要时咨询兽医
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {unfinishedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-500" />
              本周还可以补这些训练
            </h3>
            <div className="space-y-3">
              {unfinishedGoals.map((goal, index) => {
                const currentValue = calculateGoalProgress(petId, goal);
                const progress = Math.min(100, Math.round((currentValue / Math.max(1, goal.targetValue)) * 100));
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
                    className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-neutral-800 text-sm">{goal.description}</p>
                      <span className="text-xs font-bold text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      还差 {goal.targetValue - currentValue}
                      {goal.goalType === 'mastery' ? ' 分' : ' 次'}
                      完成目标
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="w-full mt-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-1"
            >
              去训练打卡
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-neutral-100 safe-area-bottom">
        {isCurrent ? (
          <div className="w-full py-3.5 bg-neutral-100 text-neutral-500 rounded-xl font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            当前操作人
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (memberId) {
                setCurrentMember(memberId);
              }
            }}
            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
          >
            <Target size={18} />
            设为当前操作人
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default MemberDetailPage;
