import { useState } from 'react';
import { Plus, Bell, Syringe, Bug, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { useReminderStore } from '../stores/useReminderStore';
import { usePetStore } from '../stores/usePetStore';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'training' | 'vaccine' | 'deworm' | 'custom';

const RemindersPage = () => {
  const { reminders, toggleReminder, deleteReminder } = useReminderStore();
  const { pets, getCurrentPet } = usePetStore();
  const currentPet = getCurrentPet();
  
  const [filter, setFilter] = useState<FilterType>('all');

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
      case 'once': return '仅一次';
      default: return repeat;
    }
  };

  return (
    <div className="pb-6">
      <Header 
        title="提醒中心" 
        rightAction={
          <button className="p-2 -mr-2 text-primary-500">
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
              <button className="mt-3 text-primary-500 font-medium text-sm">
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
    </div>
  );
};

export default RemindersPage;
