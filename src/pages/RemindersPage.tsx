import { useState, useEffect } from 'react';
import { Plus, Bell, Syringe, Bug, Calendar, ChevronRight, Trash2, X, Check, Scale, Target, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { useReminderStore } from '../stores/useReminderStore';
import { usePetStore } from '../stores/usePetStore';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { HealthTodo } from '../stores/useReminderStore';

type FilterType = 'all' | 'training' | 'vaccine' | 'deworm' | 'custom';
type ReminderType = 'training' | 'vaccine' | 'deworm' | 'custom';
type RepeatType = 'daily' | 'weekly' | 'monthly' | 'once';

const RemindersPage = () => {
  const { reminders, toggleReminder, deleteReminder, addReminder, getHealthTodos } = useReminderStore();
  const { pets, getCurrentPet } = usePetStore();
  const currentPet = getCurrentPet();
  const healthTodos = currentPet ? getHealthTodos(currentPet.id) : [];
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderType, setNewReminderType] = useState<ReminderType>('training');
  const [newReminderPetId, setNewReminderPetId] = useState<string>('');
  const [newReminderTitle, setNewReminderTitle] = useState<string>('');
  const [newReminderTime, setNewReminderTime] = useState<string>('09:00');
  const [newReminderRepeat, setNewReminderRepeat] = useState<RepeatType>('daily');
  const [newReminderNote, setNewReminderNote] = useState<string>('');

  useEffect(() => {
    if (showAddModal && currentPet) {
      setNewReminderPetId(currentPet.id);
    }
  }, [showAddModal, currentPet]);

  useEffect(() => {
    const defaultTitles: Record<ReminderType, string> = {
      training: '每日训练提醒',
      vaccine: '疫苗接种提醒',
      deworm: '驱虫提醒',
      custom: '自定义提醒',
    };
    setNewReminderTitle(defaultTitles[newReminderType]);
  }, [newReminderType]);

  const resetForm = () => {
    setNewReminderType('training');
    setNewReminderPetId(currentPet?.id || '');
    setNewReminderTitle('每日训练提醒');
    setNewReminderTime('09:00');
    setNewReminderRepeat('daily');
    setNewReminderNote('');
  };

  const handleOpenModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleConfirmAdd = () => {
    if (!newReminderPetId || !newReminderTitle || !newReminderTime) return;

    addReminder({
      petId: newReminderPetId,
      type: newReminderType,
      title: newReminderTitle,
      time: newReminderTime,
      repeat: newReminderRepeat,
      enabled: true,
      note: newReminderNote || undefined,
    });

    setShowAddModal(false);
    resetForm();
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'all') return true;
    return r.type === filter;
  });

  const filterTabs: { id: FilterType; label: string; icon: typeof Bell }[] = [
    { id: 'all', label: '全部', icon: Bell },
    { id: 'training', label: '训练', icon: Calendar },
    { id: 'vaccine', label: '疫苗', icon: Syringe },
    { id: 'deworm', label: '驱虫', icon: Bug },
    { id: 'custom', label: '自定义', icon: Bell },
  ];

  const typeTabs: { id: ReminderType; label: string; icon: typeof Bell }[] = [
    { id: 'training', label: '训练', icon: Calendar },
    { id: 'vaccine', label: '疫苗', icon: Syringe },
    { id: 'deworm', label: '驱虫', icon: Bug },
    { id: 'custom', label: '自定义', icon: Bell },
  ];

  const repeatOptions: { id: RepeatType; label: string }[] = [
    { id: 'daily', label: '每天' },
    { id: 'weekly', label: '每周' },
    { id: 'monthly', label: '每月' },
    { id: 'once', label: '仅一次' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return Calendar;
      case 'vaccine': return Syringe;
      case 'deworm': return Bug;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-primary-100 text-primary-500';
      case 'vaccine': return 'bg-blue-100 text-blue-500';
      case 'deworm': return 'bg-green-100 text-green-500';
      default: return 'bg-purple-100 text-purple-500';
    }
  };

  const getPetName = (petId: string) => {
    return pets.find(p => p.id === petId)?.name || '未知';
  };

  const getRepeatText = (repeat: string) => {
    switch (repeat) {
      case 'daily': return '每天';
      case 'weekly': return '每周';
      case 'monthly': return '每月';
      case 'once': return '仅一次';
      default: return repeat;
    }
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
      case 'vaccine': return { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-50 to-blue-100' };
      case 'deworm': return { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-50 to-green-100' };
      case 'weight': return { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-50 to-purple-100' };
      case 'goal': return { bg: 'bg-primary-100', text: 'text-primary-600', gradient: 'from-primary-50 to-secondary-50' };
      default: return { bg: 'bg-neutral-100', text: 'text-neutral-600', gradient: 'from-neutral-50 to-neutral-100' };
    }
  };

  const getPriorityStyle = (priority: HealthTodo['priority']) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-500', text: 'text-red-600', label: '紧急', dot: 'bg-red-500', lightBg: 'bg-red-50' };
      case 'medium': return { bg: 'bg-orange-500', text: 'text-orange-600', label: '待办', dot: 'bg-orange-500', lightBg: 'bg-orange-50' };
      case 'low': return { bg: 'bg-green-500', text: 'text-green-600', label: '计划', dot: 'bg-green-500', lightBg: 'bg-green-50' };
      default: return { bg: 'bg-neutral-500', text: 'text-neutral-600', label: '待办', dot: 'bg-neutral-400', lightBg: 'bg-neutral-50' };
    }
  };

  return (
    <div className="pb-6">
      <Header 
        title="提醒中心" 
        rightAction={
          <button 
            onClick={handleOpenModal}
            className="p-2 -mr-2 text-primary-500"
          >
            <Plus size={22} />
          </button>
        }
      />
      
      <div className="px-4">
        {/* 当前宠物 */}
        {currentPet && (
          <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-neutral-600 mb-1">当前宠物</p>
            <div className="flex items-center gap-3">
              <img 
                src={currentPet.avatar} 
                alt={currentPet.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-neutral-800">{currentPet.name}</h3>
                <p className="text-sm text-neutral-500">{currentPet.breed}</p>
              </div>
            </div>
          </div>
        )}

        {/* 筛选标签 */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 待办事项 */}
        {healthTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-neutral-800 mb-3 flex items-center gap-2">
              <Heart size={18} className="text-red-400" />
              待办事项
              <span className="text-xs font-normal text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                {healthTodos.length} 项
              </span>
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {healthTodos.map((todo, index) => {
                  const TodoIcon = getTodoIcon(todo.type);
                  const typeColor = getTodoColor(todo.type);
                  const priorityStyle = getPriorityStyle(todo.priority);
                  return (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className={`bg-gradient-to-r ${typeColor.gradient} rounded-2xl p-4 border border-white/60 shadow-sm`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <TodoIcon size={24} className={typeColor.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-neutral-800">{todo.title}</h4>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle.lightBg} ${priorityStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                              {priorityStyle.label}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{todo.description}</p>
                          {todo.dueDate && (
                            <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                              <Calendar size={12} />
                              到期：{format(parseISO(todo.dueDate), 'M月d日', { locale: zhCN })}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* 提醒列表 */}
        <div>
          {filteredReminders.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredReminders.map((reminder, index) => {
                  const Icon = getTypeIcon(reminder.type);
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl p-4 shadow-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(reminder.type)}`}>
                          <Icon size={22} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-neutral-800 truncate">
                              {reminder.title}
                            </h4>
                            <span className="text-lg font-bold text-primary-500">
                              {reminder.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-neutral-500">
                              {getPetName(reminder.petId)}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {getRepeatText(reminder.repeat)}
                            </span>
                          </div>
                          {reminder.note && (
                            <p className="text-sm text-neutral-400 mt-1 line-clamp-1">
                              {reminder.note}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            reminder.enabled ? 'bg-primary-500' : 'bg-neutral-200'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                              reminder.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="text-neutral-300" />
              </div>
              <p className="text-neutral-500">暂无提醒</p>
              <button 
                onClick={handleOpenModal}
                className="mt-3 text-primary-500 font-medium text-sm"
              >
                + 添加新提醒
              </button>
            </div>
          )}
        </div>

        {/* 即将到来的提醒 */}
        {filteredReminders.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">即将到来</h3>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800">狂犬疫苗即将到期</h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    豆豆的狂犬疫苗将于 3月10日 到期，请提前预约接种
                  </p>
                  <button className="mt-3 text-sm text-yellow-600 font-medium flex items-center gap-1">
                    查看详情 <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 新建提醒弹窗 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowAddModal(false)}
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
                <h3 className="text-lg font-bold">新建提醒</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 类型选择 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">类型</label>
                <div className="flex gap-2">
                  {typeTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setNewReminderType(tab.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                          newReminderType === tab.id
                            ? 'bg-primary-500 text-white shadow-soft'
                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 宠物选择 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">选择宠物</label>
                <select
                  value={newReminderPetId}
                  onChange={(e) => setNewReminderPetId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                >
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 标题输入 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">标题</label>
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="请输入提醒标题"
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 时间选择 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">时间</label>
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 重复周期 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-neutral-700 mb-2">重复周期</label>
                <div className="grid grid-cols-4 gap-2">
                  {repeatOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setNewReminderRepeat(option.id)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        newReminderRepeat === option.id
                          ? 'bg-primary-500 text-white shadow-soft'
                          : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">备注（选填）</label>
                <input
                  type="text"
                  value={newReminderNote}
                  onChange={(e) => setNewReminderNote(e.target.value)}
                  placeholder="添加备注信息..."
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none"
                />
              </div>

              {/* 取消/确认按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-neutral-100 text-neutral-600 rounded-xl font-semibold active:scale-[0.98] transition-transform"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="flex-1 py-3.5 bg-primary-500 text-white rounded-xl font-semibold active:scale-[0.98] transition-transform"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RemindersPage;
