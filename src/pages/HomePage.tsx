import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Calendar, PawPrint, TrendingUp, Flame, Target, Clock, ChevronRight, Sparkles, Star, Award,
  Syringe, Bug, Scale, Heart, CheckCircle, AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import { useReminderStore } from '../stores/useReminderStore';
import PetCard from '../components/PetCard';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';
import { motion } from 'framer-motion';
import type { TrainingGoal } from '../types';
import type { HealthTodo } from '../stores/useReminderStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { pets, currentPetId, setCurrentPet, getCurrentPet, getGoalsForPet } = usePetStore();
  const { courses, getRecordsForPet, getWeeklyStats, getRecordsForPetByDate, getWeeklySuggestions, calculateGoalProgress } = useTrainingStore();
  const { getHealthTodos } = useReminderStore();
  const currentPet = getCurrentPet();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayRecords = currentPet ? getRecordsForPetByDate(currentPet.id, today) : [];
  const weeklyStats = currentPet ? getWeeklyStats(currentPet.id) : null;
  const petGoals = currentPet ? getGoalsForPet(currentPet.id) : [];
  const healthTodos = currentPet ? getHealthTodos(currentPet.id) : [];
  const displayedTodos = healthTodos.slice(0, 3);
  
  const todayCourseIds = new Set(todayRecords.map(r => r.courseId));
  const todayTarget = 3;
  const todayProgress = (todayRecords.length / todayTarget) * 100;

  const quickActions = [
    { icon: BookOpen, label: '训练课程', color: 'from-orange-400', to: '/courses', bg: 'bg-primary-100' },
    { icon: Calendar, label: '打卡记录', color: 'from-green-400', to: '/records', bg: 'bg-secondary-100' },
    { icon: PawPrint, label: '宠物档案', color: 'from-blue-400', to: '/pets', bg: 'bg-blue-100' },
    { icon: Target, label: '每周复盘', color: 'from-purple-400', to: '/weekly-review', bg: 'bg-purple-100' },
  ];

  const recommendedCourses = courses.slice(0, 2);

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getTodoIcon = (type: HealthTodo['type']) => {
    switch (type) {
      case 'vaccine': return Syringe;
      case 'deworm': return Bug;
      case 'weight': return Scale;
      case 'goal': return Target;
      default: return Heart;
    }
  };

  const getTodoColor = (type: HealthTodo['type']) => {
    switch (type) {
      case 'vaccine': return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
      case 'deworm': return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
      case 'weight': return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
      case 'goal': return { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-200' };
      default: return { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-200' };
    }
  };

  const getPriorityStyle = (priority: HealthTodo['priority']) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-50', text: 'text-red-600', label: '紧急', dot: 'bg-red-500' };
      case 'medium': return { bg: 'bg-orange-50', text: 'text-orange-600', label: '待办', dot: 'bg-orange-500' };
      case 'low': return { bg: 'bg-green-50', text: 'text-green-600', label: '计划', dot: 'bg-green-500' };
      default: return { bg: 'bg-neutral-50', text: 'text-neutral-600', label: '待办', dot: 'bg-neutral-400' };
    }
  };

  const getGoalProgress = (petId: string, goal: TrainingGoal) => {
    const currentValue = calculateGoalProgress(petId, goal);
    const targetValue = goal.targetValue;
    let displayType = '';
    let icon: typeof Target = Target;
    let iconColor = 'bg-primary-100 text-primary-500';

    if (goal.goalType === 'frequency') {
      displayType = '训练次数';
      icon = Calendar;
      iconColor = 'bg-orange-100 text-orange-500';
    } else if (goal.goalType === 'mastery' && goal.courseId) {
      const course = courses.find(c => c.id === goal.courseId);
      displayType = course ? course.title : '重点课程';
      icon = Award;
      iconColor = 'bg-green-100 text-green-500';
    } else if (goal.goalType === 'mastery') {
      displayType = '平均评分';
      icon = Star;
      iconColor = 'bg-yellow-100 text-yellow-500';
    }

    const progress = Math.min(100, Math.max(0, (currentValue / Math.max(1, targetValue)) * 100));

    return {
      currentValue,
      targetValue,
      progress,
      displayType,
      icon,
      iconColor,
    };
  };

  return (
    <div className="pb-6">
      {/* 顶部问候区 */}
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white pt-12 pb-8 px-5 rounded-b-[32px] -mx-4 mt-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/80 text-sm">{greetingText()}，主人！</p>
          <h1 className="text-2xl font-bold mt-1">今天和{currentPet?.name || '宠物'}一起加油</h1>
          <p className="text-white/70 text-sm mt-1">
            {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
          </p>
        </motion.div>
      </div>

      <div className="px-4 -mt-4">
        {/* 宠物切换 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-x-auto hide-scrollbar -mx-4 px-4"
        >
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {pets.map((pet) => (
              <div key={pet.id} className="w-64 flex-shrink-0">
                <PetCard
                  pet={pet}
                  isActive={pet.id === currentPetId}
                  onClick={() => setCurrentPet(pet.id)}
                />
              </div>
            ))}
            <div 
              onClick={() => navigate('/pets/add')}
              className="w-28 flex-shrink-0 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-neutral-200 hover:border-primary-300 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
                <PawPrint size={20} className="text-primary-400" />
              </div>
              <span className="text-sm text-neutral-500">添加宠物</span>
            </div>
          </div>
        </motion.div>

        {/* 今日计划 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-neutral-800">今日训练</h2>
            <span className="text-sm text-primary-600 font-medium">
              {todayRecords.length}/{todayTarget} 项
            </span>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <ProgressBar value={todayProgress} />
            
            <div className="mt-4 space-y-3">
              {todayRecords.length > 0 ? (
                todayRecords.slice(0, 3).map((record, index) => {
                  const course = courses.find(c => c.id === record.courseId);
                  return (
                    <div 
                      key={record.id} 
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                        <Sparkles size={20} className="text-secondary-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">
                          {course?.title || '训练课程'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {Math.round(record.durationSeconds / 60)}分钟 · {formatDistanceToNow(new Date(record.date), { addSuffix: true, locale: zhCN })}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-400">今天还没有训练记录</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="mt-3 text-primary-500 font-medium text-sm"
                  >
                    去选择课程 →
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 健康待办 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <Heart size={18} className="text-red-400" />
              健康待办
            </h2>
            {healthTodos.length > 0 && (
              <button 
                onClick={() => navigate('/reminders')}
                className="flex items-center gap-1 text-sm text-primary-500 font-medium"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-card">
            {displayedTodos.length > 0 ? (
              <div className="space-y-3">
                {displayedTodos.map((todo, index) => {
                  const TodoIcon = getTodoIcon(todo.type);
                  const typeColor = getTodoColor(todo.type);
                  const priorityStyle = getPriorityStyle(todo.priority);
                  return (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-xl ${typeColor.bg} flex items-center justify-center flex-shrink-0`}>
                        <TodoIcon size={20} className={typeColor.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-800 text-sm">{todo.title}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                            {priorityStyle.label}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{todo.description}</p>
                        {todo.dueDate && (
                          <p className="text-xs text-neutral-400 mt-1">
                            到期时间：{format(parseISO(todo.dueDate), 'M月d日', { locale: zhCN })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <p className="text-neutral-600 font-medium">暂无待办，一切正常 ✓</p>
                <p className="text-neutral-400 text-sm mt-1">宠物状态良好，继续保持</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 快捷入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-neutral-800 mb-3">快捷入口</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(action.to)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-card hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                    <Icon size={24} className="text-primary-500" />
                  </div>
                  <span className="text-xs font-medium text-neutral-700">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 本周统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-neutral-800 mb-3">本周统计</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-2">
                <Flame size={20} className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{weeklyStats?.streak || 0}</p>
              <p className="text-xs text-neutral-500 mt-1">连续打卡</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-secondary-100 flex items-center justify-center mb-2">
                <Target size={20} className="text-secondary-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{weeklyStats?.totalTrainings || 0}</p>
              <p className="text-xs text-neutral-500 mt-1">训练次数</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {weeklyStats ? Math.round(weeklyStats.totalDuration / 60) : 0}
              </p>
              <p className="text-xs text-neutral-500 mt-1">总分钟</p>
            </div>
          </div>
        </motion.div>

        {/* 训练目标进度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-neutral-800 mb-3">训练目标进度</h2>
          <div className="bg-white rounded-2xl p-5 shadow-card">
            {petGoals.length > 0 ? (
              <div className="space-y-4">
                {petGoals.map((goal, index) => {
                  const { currentValue, targetValue, progress, displayType, icon: GoalIcon, iconColor } = getGoalProgress(currentPet.id, goal);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.45 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
                          <GoalIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-800 text-sm truncate">
                            {displayType}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                      <div className="ml-12">
                        <ProgressBar value={progress} size="sm" />
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-xs text-neutral-500">
                            {currentValue}/{targetValue}
                            {goal.goalType === 'mastery' ? ' 分' : ' 次'}
                          </p>
                          <p className="text-xs font-medium text-primary-600">
                            {Math.round(progress)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                  <Target size={28} className="text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-sm">还没有设置训练目标</p>
                <p className="text-neutral-400 text-xs mt-1">去宠物档案设置吧</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/pets')}
                  className="mt-4 px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors"
                >
                  去设置目标
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* 推荐课程 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-neutral-800">推荐课程</h2>
            <button 
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1 text-sm text-primary-500 font-medium"
            >
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {recommendedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
