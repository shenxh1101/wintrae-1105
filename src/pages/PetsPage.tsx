import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Scale, Syringe, Bug, Edit2, Trash2, ChevronRight,
  Calendar, Target, Award, Users, X, Check, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import { useReminderStore } from '../stores/useReminderStore';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'info' | 'weight' | 'vaccine' | 'deworm' | 'goal';

type GoalTypeOption = 'frequency' | 'rating' | 'course';

const PetsPage = () => {
  const navigate = useNavigate();
  const { 
    pets, currentPetId, setCurrentPet, getCurrentPet, 
    getWeightRecordsForPet, getVaccineRecordsForPet, getDewormRecordsForPet,
    getGoalsForPet, addTrainingGoal, deleteTrainingGoal, deletePet
  } = usePetStore();
  const { courses, getWeeklyStats, deleteRecordsForPet } = useTrainingStore();
  const { deleteRemindersForPet } = useReminderStore();
  
  const currentPet = getCurrentPet();
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<GoalTypeOption>('frequency');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('5');
  const [newGoalCourseId, setNewGoalCourseId] = useState<string>('');
  const [newGoalDescription, setNewGoalDescription] = useState<string>('');
  const [newGoalDeadline, setNewGoalDeadline] = useState<string>('');

  const weightRecords = currentPet ? getWeightRecordsForPet(currentPet.id) : [];
  const vaccineRecords = currentPet ? getVaccineRecordsForPet(currentPet.id) : [];
  const dewormRecords = currentPet ? getDewormRecordsForPet(currentPet.id) : [];
  const goals = currentPet ? getGoalsForPet(currentPet.id) : [];
  const weeklyStats = currentPet ? getWeeklyStats(currentPet.id) : null;

  const weightChartData = weightRecords.map(r => ({
    date: format(new Date(r.date), 'M/d'),
    weight: r.weightKg,
  }));

  const goalDisplayInfo = useMemo(() => {
    return goals.map(goal => {
      let displayType = '';
      let currentValue = 0;
      let targetValue = goal.targetValue;
      let progress = 0;

      if (goal.goalType === 'frequency') {
        displayType = '本周训练次数';
        currentValue = weeklyStats?.totalTrainings || 0;
        targetValue = goal.targetValue;
        progress = Math.min(100, Math.round((currentValue / Math.max(1, targetValue)) * 100));
      } else if (goal.goalType === 'mastery' && goal.courseId) {
        const course = courses.find(c => c.id === goal.courseId);
        displayType = `重点课程：${course?.title || '未知课程'}`;
        const recordsForCourse = useTrainingStore.getState().records
          .filter(r => r.petId === goal.petId && r.courseId === goal.courseId);
        currentValue = recordsForCourse.length > 0
          ? Math.round(recordsForCourse.reduce((s, r) => s + r.rating, 0) / recordsForCourse.length * 10) / 10
          : 0;
        targetValue = goal.targetValue;
        progress = Math.min(100, Math.round((currentValue / Math.max(1, targetValue)) * 100));
      } else {
        displayType = '平均评分';
        currentValue = weeklyStats?.averageRating || 0;
        targetValue = goal.targetValue;
        progress = Math.min(100, Math.round((currentValue / Math.max(1, targetValue)) * 100));
      }

      return { ...goal, displayType, currentValue, targetValue, progress };
    });
  }, [goals, weeklyStats, courses]);

  const ageText = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainMonths = months % 12;
      return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`;
    }
    return `${months}个月`;
  };

  const tabs = [
    { id: 'info' as const, label: '基本信息', icon: Edit2 },
    { id: 'weight' as const, label: '体重曲线', icon: Scale },
    { id: 'vaccine' as const, label: '疫苗记录', icon: Syringe },
    { id: 'deworm' as const, label: '驱虫记录', icon: Bug },
    { id: 'goal' as const, label: '训练目标', icon: Target },
  ] as const;

  const handleDeletePet = () => {
    if (currentPet) {
      deletePet(currentPet.id);
      deleteRecordsForPet(currentPet.id);
      deleteRemindersForPet(currentPet.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleAddGoal = () => {
    if (!currentPet) return;
    
    const targetValue = parseFloat(newGoalTarget);
    if (isNaN(targetValue) || targetValue <= 0) return;

    let goalType: 'frequency' | 'mastery' = 'frequency';
    let description = newGoalDescription;
    let courseId: string | undefined = undefined;

    if (newGoalType === 'frequency') {
      goalType = 'frequency';
      if (!description) description = `本周训练${targetValue}次`;
    } else if (newGoalType === 'rating') {
      goalType = 'mastery';
      if (!description) description = `平均评分达到${targetValue}分`;
    } else if (newGoalType === 'course') {
      goalType = 'mastery';
      courseId = newGoalCourseId || undefined;
      const course = courses.find(c => c.id === courseId);
      if (!description) description = course ? `「${course.title}」平均评分达到${targetValue}分` : `重点课程平均评分达到${targetValue}分`;
    }

    addTrainingGoal({
      petId: currentPet.id,
      goalType,
      targetValue,
      courseId,
      description,
      deadline: newGoalDeadline || undefined,
    });

    setShowAddGoalModal(false);
    setNewGoalType('frequency');
    setNewGoalTarget('5');
    setNewGoalCourseId('');
    setNewGoalDescription('');
    setNewGoalDeadline('');
  };

  if (!currentPet) {
    return (
      <div className="pb-6">
        <Header title="宠物档案" />
        <div className="px-4">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Target size={32} className="text-neutral-300" />
            </div>
            <p className="text-neutral-500 mb-4">还没有添加宠物</p>
            <button
              onClick={() => navigate('/pets/add')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              添加宠物
            </button>
          </div>
        </div>
      </div>
    );
  }

  const goalTypeOptions: { id: GoalTypeOption; label: string; desc: string; color: string }[] = [
    { id: 'frequency', label: '本周次数', desc: '设定本周训练次数目标', color: 'bg-orange-100 text-orange-600' },
    { id: 'rating', label: '平均评分', desc: '设定平均训练评分目标', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'course', label: '重点课程', desc: '针对某门课程设定评分目标', color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="pb-6">
      <Header 
        title="宠物档案"
        rightAction={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 -mr-2 text-neutral-500 hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        }
      />
      
      <div className="px-4">
        {/* 宠物选择 */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 mb-6">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPet(pet.id)}
                className={`flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all ${
                  pet.id === currentPetId
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 scale-105'
                    : 'bg-white shadow-card hover:shadow-md'
                }`}
                style={{ width: 100 }}
              >
                <img
                  src={pet.avatar}
                  alt={pet.name}
                  className={`w-14 h-14 rounded-full object-cover mb-2 border-2 ${
                    pet.id === currentPetId ? 'border-white/30' : 'border-transparent'
                  }`}
                />
                <span className={`font-semibold text-sm ${
                  pet.id === currentPetId ? 'text-white' : 'text-neutral-800'
                }`}>
                  {pet.name}
                </span>
                <span className={`text-xs mt-0.5 ${
                  pet.id === currentPetId ? 'text-white/70' : 'text-neutral-500'
                }`}>
                  {pet.type === 'dog' ? '狗狗' : '猫咪'}
                </span>
              </motion.div>
            ))}
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pets/add')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border-2 border-dashed border-neutral-200 hover:border-primary-300 transition-colors"
              style={{ width: 100 }}
            >
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                <Plus size={24} className="text-neutral-400" />
              </div>
              <span className="font-medium text-sm text-neutral-500">添加</span>
            </motion.button>
          </div>
        </div>

        {/* 宠物信息卡片 */}
        <motion.div
          key={currentPet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl p-6 text-white mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <img
                src={currentPet.avatar}
                alt={currentPet.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{currentPet.name}</h2>
                <p className="text-white/80 mt-1">{currentPet.breed}</p>
                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="text-white/60 text-xs">年龄</p>
                    <p className="font-semibold">{ageText(currentPet.ageMonths)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">体重</p>
                    <p className="font-semibold">{currentPet.weightKg}kg</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">性别</p>
                    <p className="font-semibold">{currentPet.gender === 'male' ? '公' : '母'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab 导航 */}
        <div className="flex bg-white rounded-2xl p-1 shadow-card mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all whitespace-nowrap min-w-[72px] ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-neutral-500'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 内容 */}
        <AnimatePresence mode="wait">
          {/* 基本信息 */}
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-bold text-neutral-800 mb-4">基本信息</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                    <span className="text-neutral-500">名字</span>
                    <span className="font-medium text-neutral-800">{currentPet.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                    <span className="text-neutral-500">品种</span>
                    <span className="font-medium text-neutral-800">{currentPet.breed}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                    <span className="text-neutral-500">类型</span>
                    <span className="font-medium text-neutral-800">{currentPet.type === 'dog' ? '狗狗' : '猫咪'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                    <span className="text-neutral-500">年龄</span>
                    <span className="font-medium text-neutral-800">{ageText(currentPet.ageMonths)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                    <span className="text-neutral-500">体重</span>
                    <span className="font-medium text-neutral-800">{currentPet.weightKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">到家时间</span>
                    <span className="font-medium text-neutral-800">
                      {format(new Date(currentPet.createdAt), 'yyyy年M月d日', { locale: zhCN })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-bold text-neutral-800 mb-4">训练成就</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                      <Award size={24} className="text-yellow-500" />
                    </div>
                    <p className="text-xl font-bold text-neutral-800">0</p>
                    <p className="text-xs text-neutral-500">已掌握技能</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-2">
                      <Calendar size={24} className="text-primary-500" />
                    </div>
                    <p className="text-xl font-bold text-neutral-800">{weeklyStats?.streak || 0}</p>
                    <p className="text-xs text-neutral-500">训练天数</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-secondary-100 rounded-full flex items-center justify-center mb-2">
                      <Target size={24} className="text-secondary-500" />
                    </div>
                    <p className="text-xl font-bold text-neutral-800">
                      {goals.filter(g => {
                        if (g.goalType === 'frequency') return (weeklyStats?.totalTrainings || 0) >= g.targetValue;
                        return (weeklyStats?.averageRating || 0) >= g.targetValue;
                      }).length}/{goals.length}
                    </p>
                    <p className="text-xs text-neutral-500">达成目标</p>
                  </div>
                </div>
              </div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/family')}
                className="bg-white rounded-2xl p-5 shadow-card cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800">家庭成员</h3>
                      <p className="text-sm text-neutral-500">邀请家人一起照顾</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-neutral-400" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 体重曲线 */}
          {activeTab === 'weight' && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neutral-800">体重变化</h3>
                  <button className="text-sm text-primary-500 font-medium">
                    + 记录体重
                  </button>
                </div>
                
                {weightChartData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF8C42" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }}
                          formatter={(value: number) => [`${value} kg`, '体重']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#FF8C42" 
                          strokeWidth={3}
                          dot={{ fill: '#FF8C42', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#FF8C42', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-neutral-400">暂无体重记录</p>
                  </div>
                )}
              </div>

              {/* 体重记录列表 */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="font-bold text-neutral-800 mb-4">体重记录</h3>
                {weightRecords.length > 0 ? (
                  <div className="space-y-3">
                    {[...weightRecords].reverse().map((record) => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between py-3 border-b border-neutral-50 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-neutral-800">{record.weightKg} kg</p>
                          <p className="text-sm text-neutral-500">
                            {format(new Date(record.date), 'yyyy年M月d日', { locale: zhCN })}
                          </p>
                        </div>
                        {record.note && (
                          <span className="text-sm text-neutral-400">{record.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale size={32} className="mx-auto text-neutral-300 mb-2" />
                    <p className="text-neutral-400 text-sm">还没有体重记录</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 疫苗记录 */}
          {activeTab === 'vaccine' && (
            <motion.div
              key="vaccine"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-neutral-800">疫苗记录</h3>
                <button className="text-sm text-primary-500 font-medium">
                  + 添加记录
                </button>
              </div>
              
              {vaccineRecords.length > 0 ? (
                <div className="space-y-3">
                  {vaccineRecords.map((record) => {
                    const nextDate = record.nextDate ? new Date(record.nextDate) : null;
                    const isUpcoming = nextDate && nextDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div 
                        key={record.id}
                        className="bg-white rounded-2xl p-4 shadow-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Syringe size={20} className="text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-800">{record.name}</h4>
                            <p className="text-sm text-neutral-500 mt-1">
                              接种日期：{format(new Date(record.date), 'yyyy年M月d日', { locale: zhCN })}
                            </p>
                            {record.nextDate && (
                              <p className={`text-sm mt-1 ${isUpcoming ? 'text-red-500' : 'text-neutral-500'}`}>
                                下次接种：{format(new Date(record.nextDate), 'yyyy年M月d日', { locale: zhCN })}
                                {isUpcoming && ' (即将到期)'}
                              </p>
                            )}
                            {record.hospital && (
                              <p className="text-xs text-neutral-400 mt-1">
                                医院：{record.hospital}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                  <Syringe size={40} className="mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">还没有疫苗记录</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 驱虫记录 */}
          {activeTab === 'deworm' && (
            <motion.div
              key="deworm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-neutral-800">驱虫记录</h3>
                <button className="text-sm text-primary-500 font-medium">
                  + 添加记录
                </button>
              </div>
              
              {dewormRecords.length > 0 ? (
                <div className="space-y-3">
                  {dewormRecords.map((record) => {
                    const nextDate = record.nextDate ? new Date(record.nextDate) : null;
                    const isUpcoming = nextDate && nextDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div 
                        key={record.id}
                        className="bg-white rounded-2xl p-4 shadow-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            record.type === 'internal' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            <Bug size={20} className={record.type === 'internal' ? 'text-green-500' : 'text-purple-500'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-neutral-800">
                                {record.type === 'internal' ? '体内驱虫' : '体外驱虫'}
                              </h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                record.type === 'internal' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                              }`}>
                                {record.type === 'internal' ? '体内' : '体外'}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-1">
                              驱虫日期：{format(new Date(record.date), 'yyyy年M月d日', { locale: zhCN })}
                            </p>
                            {record.nextDate && (
                              <p className={`text-sm mt-1 ${isUpcoming ? 'text-red-500' : 'text-neutral-500'}`}>
                                下次驱虫：{format(new Date(record.nextDate), 'yyyy年M月d日', { locale: zhCN })}
                                {isUpcoming && ' (即将到期)'}
                              </p>
                            )}
                            {record.product && (
                              <p className="text-xs text-neutral-400 mt-1">
                                产品：{record.product}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                  <Bug size={40} className="mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500">还没有驱虫记录</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 训练目标 */}
          {activeTab === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-neutral-800">训练目标</h3>
                <button 
                  onClick={() => setShowAddGoalModal(true)}
                  className="text-sm text-primary-500 font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  添加目标
                </button>
              </div>
              
              {goalDisplayInfo.length > 0 ? (
                <div className="space-y-3">
                  {goalDisplayInfo.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl p-4 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              goal.goalType === 'frequency' ? 'bg-orange-100' : 'bg-yellow-100'
                            }`}>
                              {goal.goalType === 'frequency' ? (
                                <Calendar size={16} className="text-orange-500" />
                              ) : (
                                <Star size={16} className="text-yellow-500" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-neutral-600">{goal.displayType}</span>
                          </div>
                          <p className="text-sm text-neutral-500 mb-3">{goal.description}</p>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-500">当前进度</span>
                              <span className="font-semibold text-neutral-800">
                                {goal.currentValue} / {goal.targetValue}
                                {goal.goalType !== 'frequency' && ' 分'}
                              </span>
                            </div>
                            <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${goal.progress}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`h-full rounded-full ${
                                  goal.progress >= 100
                                    ? 'bg-green-500'
                                    : goal.progress >= 60
                                    ? 'bg-primary-500'
                                    : 'bg-secondary-400'
                                }`}
                              />
                            </div>
                          </div>

                          {goal.deadline && (
                            <div className="flex items-center gap-1 mt-3 text-xs text-neutral-400">
                              <Calendar size={12} />
                              <span>截止日期：{format(new Date(goal.deadline), 'yyyy年M月d日', { locale: zhCN })}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTrainingGoal(goal.id)}
                          className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                  <Target size={40} className="mx-auto text-neutral-300 mb-3" />
                  <p className="text-neutral-500 mb-2">还没有设定训练目标</p>
                  <p className="text-neutral-400 text-sm mb-4">设定目标，让训练更有方向</p>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    添加第一个目标
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800 text-center mb-2">
                确定删除{currentPet.name}吗？
              </h3>
              <p className="text-neutral-500 text-center text-sm mb-6">
                删除后所有相关数据（训练记录、提醒、目标等）都将丢失，无法恢复
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleDeletePet}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加目标弹窗 */}
      <AnimatePresence>
        {showAddGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowAddGoalModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 safe-area-bottom text-neutral-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">添加训练目标</h3>
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 目标类型选择 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">目标类型</label>
                <div className="space-y-2">
                  {goalTypeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setNewGoalType(option.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        newGoalType === option.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${option.color}`}>
                        {option.id === 'frequency' && <Calendar size={18} />}
                        {option.id === 'rating' && <Star size={18} />}
                        {option.id === 'course' && <Target size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">{option.label}</p>
                        <p className="text-xs text-neutral-500">{option.desc}</p>
                      </div>
                      {newGoalType === option.id && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 选择课程（仅 course 类型） */}
              {newGoalType === 'course' && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">选择课程</label>
                  <select
                    value={newGoalCourseId}
                    onChange={(e) => setNewGoalCourseId(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                  >
                    <option value="">请选择课程</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 目标值 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  目标值{newGoalType === 'rating' || newGoalType === 'course' ? '（满分5分）' : '（次）'}
                </label>
                <input
                  type="number"
                  step={newGoalType === 'rating' || newGoalType === 'course' ? '0.1' : '1'}
                  min="0"
                  max={newGoalType === 'rating' || newGoalType === 'course' ? '5' : undefined}
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder={newGoalType === 'frequency' ? '例如：5' : '例如：4.5'}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 描述 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">目标描述（选填）</label>
                <input
                  type="text"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  placeholder="描述一下这个目标..."
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 截止日期 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">截止日期（选填）</label>
                <input
                  type="date"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 添加按钮 */}
              <button
                onClick={handleAddGoal}
                className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold active:scale-[0.98] transition-transform"
              >
                添加目标
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetsPage;
