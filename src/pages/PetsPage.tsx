import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Scale, Syringe, Bug, Edit2, Trash2, ChevronRight,
  Calendar, Target, Award, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { usePetStore } from '../stores/usePetStore';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'info' | 'weight' | 'vaccine' | 'deworm';

const PetsPage = () => {
  const navigate = useNavigate();
  const { pets, currentPetId, setCurrentPet, getCurrentPet, getWeightRecordsForPet, getVaccineRecordsForPet, getDewormRecordsForPet } = usePetStore();
  const currentPet = getCurrentPet();
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const weightRecords = currentPet ? getWeightRecordsForPet(currentPet.id) : [];
  const vaccineRecords = currentPet ? getVaccineRecordsForPet(currentPet.id) : [];
  const dewormRecords = currentPet ? getDewormRecordsForPet(currentPet.id) : [];

  const weightChartData = weightRecords.map(r => ({
    date: format(new Date(r.date), 'M/d'),
    weight: r.weightKg,
  }));

  const ageText = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainMonths = months % 12;
      return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`;
    }
    return `${months}个月`;
  };

  const tabs = [
    { id: 'info', label: '基本信息', icon: Edit2 },
    { id: 'weight', label: '体重曲线', icon: Scale },
    { id: 'vaccine', label: '疫苗记录', icon: Syringe },
    { id: 'deworm', label: '驱虫记录', icon: Bug },
  ] as const;

  const handleDeletePet = () => {
    // 删除逻辑
    setShowDeleteConfirm(false);
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
        <div className="flex bg-white rounded-2xl p-1 shadow-card mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
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
                    <p className="text-xl font-bold text-neutral-800">0</p>
                    <p className="text-xs text-neutral-500">训练天数</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-secondary-100 rounded-full flex items-center justify-center mb-2">
                      <Target size={24} className="text-secondary-500" />
                    </div>
                    <p className="text-xl font-bold text-neutral-800">0</p>
                    <p className="text-xs text-neutral-500">达成目标</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-card">
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
              </div>
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
                删除后所有相关数据都将丢失，无法恢复
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
    </div>
  );
};

export default PetsPage;
