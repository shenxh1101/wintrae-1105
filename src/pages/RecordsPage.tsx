import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Star, Gift, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import Header from '../components/Header';
import Rating from '../components/Rating';
import PetCard from '../components/PetCard';
import { motion, AnimatePresence } from 'framer-motion';

const RecordsPage = () => {
  const navigate = useNavigate();
  const { pets, currentPetId, setCurrentPet, getCurrentPet, getMemberById, familyMembers } = usePetStore();
  const { courses, getRecordsForPet, getRecordsForPetByDate } = useTrainingStore();
  
  const currentPet = getCurrentPet();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState<string>('all');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const allRecords = currentPet ? getRecordsForPet(currentPet.id) : [];
  const records = memberFilter === 'all' 
    ? allRecords 
    : allRecords.filter(r => r.completedBy === memberFilter);
  
  const allSelectedDateRecords = selectedDate && currentPet
    ? getRecordsForPetByDate(currentPet.id, selectedDate)
    : [];
  const selectedDateRecords = memberFilter === 'all'
    ? allSelectedDateRecords
    : allSelectedDateRecords.filter(r => r.completedBy === memberFilter);

  const allTrainingDates = new Set(allRecords.map(r => r.date));
  const trainingDates = new Set(records.map(r => r.date));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs > 0 ? secs + '秒' : '钟'}`;
    }
    return `${secs}秒`;
  };

  const stats = {
    totalTrainings: records.length,
    totalDays: trainingDates.size,
    avgRating: records.length > 0 
      ? (records.reduce((sum, r) => sum + r.rating, 0) / records.length).toFixed(1)
      : '0',
    streak: 0,
  };

  const filterOptions = [
    { id: 'all', name: '全部', color: '#6B7280' },
    ...familyMembers.map(m => ({ id: m.id, name: m.name, color: m.color })),
  ];

  return (
    <div className="pb-6">
      <Header title="打卡记录" />
      
      <div className="px-4">
        {/* 宠物切换 */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {pets.map((pet) => (
              <div key={pet.id} className="w-40 flex-shrink-0">
                <PetCard
                  pet={pet}
                  isActive={pet.id === currentPetId}
                  onClick={() => setCurrentPet(pet.id)}
                  compact
                />
              </div>
            ))}
          </div>
        </div>

        {/* 完成人筛选 */}
        <div className="mb-4">
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              {filterOptions.map((option) => {
                const isActive = memberFilter === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setMemberFilter(option.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all ${
                      isActive
                        ? 'border-primary-400 bg-primary-50 shadow-soft'
                        : 'border-neutral-100 bg-white hover:border-neutral-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        isActive ? 'ring-2 ring-white ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: option.color }}
                    >
                      {option.id === 'all' ? '✓' : option.name.charAt(0)}
                    </div>
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      isActive ? 'text-primary-600' : 'text-neutral-600'
                    }`}>
                      {option.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-primary-600">{stats.totalTrainings}</p>
            <p className="text-xs text-neutral-500 mt-0.5">总次数</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-secondary-600">{stats.totalDays}</p>
            <p className="text-xs text-neutral-500 mt-0.5">训练天数</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-yellow-500">{stats.avgRating}</p>
            <p className="text-xs text-neutral-500 mt-0.5">平均评分</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-red-500">0</p>
            <p className="text-xs text-neutral-500 mt-0.5">连续打卡</p>
          </div>
        </div>

        {/* 日历 */}
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
            >
              <ChevronLeft size={18} className="text-neutral-600" />
            </button>
            <h2 className="text-lg font-bold text-neutral-800">
              {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
            >
              <ChevronRight size={18} className="text-neutral-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm py-2 ${
                  index === 0 || index === 6 ? 'text-red-400' : 'text-neutral-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasTraining = allTrainingDates.has(dateStr);
              const hasFilteredTraining = trainingDates.has(dateStr);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate === dateStr;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const dayOfWeek = index % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    relative aspect-square flex items-center justify-center rounded-xl text-sm
                    transition-all duration-200
                    ${!isCurrentMonth ? 'text-neutral-200' : ''}
                    ${isCurrentMonth && isWeekend ? 'text-red-400' : ''}
                    ${isToday ? 'ring-2 ring-primary-400' : ''}
                    ${isSelected ? 'bg-primary-500 text-white' : ''}
                    ${isCurrentMonth && !isSelected ? 'hover:bg-primary-50' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasTraining && isCurrentMonth && (
                    <div
                      className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : hasFilteredTraining ? 'bg-secondary-500' : 'bg-neutral-300'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 选中日期的记录 */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-neutral-800 mb-3">
                {format(new Date(selectedDate), 'M月d日 EEEE', { locale: zhCN })} 训练记录
              </h3>
              
              {selectedDateRecords.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateRecords.map((record) => {
                    const course = courses.find(c => c.id === record.courseId);
                    const completedByMember = record.completedBy ? getMemberById(record.completedBy) : undefined;
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(`/records/${record.id}`)}
                        className="bg-white rounded-2xl p-4 shadow-card cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl bg-primary-100 flex-shrink-0 overflow-hidden">
                            {course?.image && (
                              <img src={course.image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-neutral-800 truncate">
                                {course?.title || '训练课程'}
                              </h4>
                              <Rating value={record.rating} size={14} readonly />
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatDuration(record.durationSeconds)}
                              </span>
                              {record.rewards.length > 0 && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                  <Gift size={14} />
                                  {record.rewards.reduce((sum, r) => sum + r.count, 0)}次奖励
                                </span>
                              )}
                              {completedByMember && (
                                <span className="flex items-center gap-1">
                                  <div
                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ backgroundColor: completedByMember.color }}
                                  >
                                    {completedByMember.name.charAt(0)}
                                  </div>
                                  <span style={{ color: completedByMember.color }}>
                                    {completedByMember.name}
                                  </span>
                                </span>
                              )}
                            </div>
                            
                            {record.behaviorNotes.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                                <AlertTriangle size={12} />
                                <span>异常行为: {record.behaviorNotes.map(b => b.behavior).join(', ')}</span>
                              </div>
                            )}
                            
                            {record.notes && (
                              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                                {record.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-2xl">
                  <p className="text-neutral-400">这一天没有训练记录</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 全部记录 */}
        {!selectedDate && (
          <div>
            <h3 className="text-lg font-bold text-neutral-800 mb-3">全部记录</h3>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.slice(0, 10).map((record, index) => {
                  const course = courses.find(c => c.id === record.courseId);
                  const completedByMember = record.completedBy ? getMemberById(record.completedBy) : undefined;
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/records/${record.id}`)}
                      className="bg-white rounded-2xl p-4 shadow-card cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">
                          {format(new Date(record.date), 'M月d日', { locale: zhCN })}
                        </span>
                        <Rating value={record.rating} size={14} readonly />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex-shrink-0 overflow-hidden">
                          {course?.image && (
                            <img src={course.image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-neutral-800 truncate">
                            {course?.title || '训练课程'}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-neutral-500">
                              {formatDuration(record.durationSeconds)}
                            </span>
                            {completedByMember && (
                              <span className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                  style={{ backgroundColor: completedByMember.color }}
                                >
                                  {completedByMember.name.charAt(0)}
                                </div>
                                <span className="text-xs" style={{ color: completedByMember.color }}>
                                  {completedByMember.name}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Star size={32} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500">还没有训练记录</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="mt-3 text-primary-500 font-medium"
                >
                  去开始第一次训练
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsPage;
