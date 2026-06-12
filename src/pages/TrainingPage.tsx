import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Gift, AlertTriangle, 
  Check, Star, Trophy, X
} from 'lucide-react';
import { useTrainingStore } from '../stores/useTrainingStore';
import { usePetStore } from '../stores/usePetStore';
import Rating from '../components/Rating';
import { motion, AnimatePresence } from 'framer-motion';

type TrainingPhase = 'ready' | 'running' | 'paused' | 'finished';

const TrainingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById, addRecord } = useTrainingStore();
  const { getCurrentPet } = usePetStore();
  
  const course = getCourseById(id || '');
  const currentPet = getCurrentPet();
  
  const [phase, setPhase] = useState<TrainingPhase>('ready');
  const [seconds, setSeconds] = useState(0);
  const [rewardCount, setRewardCount] = useState(0);
  const [showRewardAnim, setShowRewardAnim] = useState(false);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [behaviorText, setBehaviorText] = useState('');
  const [behaviorList, setBehaviorList] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setPhase('running');
  };

  const handlePause = () => {
    setPhase('paused');
  };

  const handleResume = () => {
    setPhase('running');
  };

  const handleReset = () => {
    setPhase('ready');
    setSeconds(0);
    setRewardCount(0);
    setCurrentStep(0);
  };

  const handleReward = () => {
    setRewardCount(c => c + 1);
    setShowRewardAnim(true);
    setTimeout(() => setShowRewardAnim(false), 1000);
  };

  const handleFinish = () => {
    setPhase('finished');
  };

  const handleAddBehavior = () => {
    if (behaviorText.trim()) {
      setBehaviorList([...behaviorList, behaviorText.trim()]);
      setBehaviorText('');
    }
  };

  const handleRemoveBehavior = (index: number) => {
    setBehaviorList(behaviorList.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (!course || !currentPet) return;
    
    const today = new Date().toISOString().split('T')[0];
    addRecord({
      petId: currentPet.id,
      courseId: course.id,
      date: today,
      durationSeconds: seconds,
      rating,
      notes,
      rewards: [
        {
          id: `reward-${Date.now()}`,
          type: 'treat',
          count: rewardCount,
          description: '训练奖励',
        },
      ],
      behaviorNotes: behaviorList.map((b, i) => ({
        id: `behavior-${Date.now()}-${i}`,
        behavior: b,
        description: b,
        isAbnormal: true,
      })),
    });
    
    navigate('/records');
  };

  const nextStep = () => {
    if (course && currentStep < course.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!course || !currentPet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">课程不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
      {/* 顶部 */}
      <div className="flex items-center justify-between p-4 safe-area-top">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">{course.title}</h1>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {/* 准备阶段 */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 flex flex-col items-center justify-center flex-1 pt-8"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
              <img 
                src={currentPet.avatar} 
                alt={currentPet.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white/30"
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">准备好了吗？</h2>
            <p className="text-white/70 text-center mb-8">
              和{currentPet.name}一起完成「{course.title}」训练
            </p>

            <div className="w-full bg-white/10 backdrop-blur rounded-2xl p-5 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">预计时长</span>
                <span className="font-medium">{course.durationMin}分钟</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">训练步骤</span>
                <span className="font-medium">{course.steps.length}步</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95"
            >
              开始训练
            </button>
          </motion.div>
        )}

        {/* 训练进行中 */}
        {(phase === 'running' || phase === 'paused') && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 flex flex-col items-center flex-1"
          >
            {/* 计时器 */}
            <div className="relative my-8">
              <motion.div
                animate={phase === 'running' ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-56 h-56 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
              >
                <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold tracking-wider">
                      {formatTime(seconds)}
                    </div>
                    <p className="text-white/70 text-sm mt-2">训练时长</p>
                  </div>
                </div>
              </motion.div>
              
              {/* 奖励动画 */}
              <AnimatePresence>
                {showRewardAnim && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Gift size={60} className="text-yellow-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 当前步骤 */}
            <div className="w-full bg-white/10 backdrop-blur rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm">步骤 {currentStep + 1}/{course.steps.length}</span>
                <span className="text-white/50 text-xs">
                  进度 {Math.round(((currentStep + 1) / course.steps.length) * 100)}%
                </span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {course.steps[currentStep]}
              </p>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex-1 py-2 bg-white/10 rounded-xl text-sm font-medium disabled:opacity-30"
                >
                  上一步
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep >= course.steps.length - 1}
                  className="flex-1 py-2 bg-white/20 rounded-xl text-sm font-medium disabled:opacity-30"
                >
                  下一步
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-6 mb-6">
              {/* 重置 */}
              <button
                onClick={handleReset}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
              >
                <RotateCcw size={24} />
              </button>
              
              {/* 播放/暂停 */}
              <button
                onClick={phase === 'running' ? handlePause : handleResume}
                className="w-20 h-20 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                {phase === 'running' ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </button>
              
              {/* 奖励 */}
              <button
                onClick={handleReward}
                className="w-14 h-14 rounded-full bg-yellow-400/90 text-yellow-800 flex items-center justify-center shadow-lg active:scale-95 transition-transform relative"
              >
                <Gift size={24} />
                {rewardCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {rewardCount}
                  </span>
                )}
              </button>
            </div>

            {/* 异常行为记录 */}
            <button
              onClick={() => setShowBehaviorModal(true)}
              className="flex items-center gap-2 text-white/80 text-sm mb-4"
            >
              <AlertTriangle size={16} />
              记录异常行为
              {behaviorList.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {behaviorList.length}条
                </span>
              )}
            </button>

            {/* 完成按钮 */}
            <button
              onClick={handleFinish}
              className="w-full py-4 bg-white/20 backdrop-blur rounded-full font-bold text-lg border border-white/30 active:scale-95 transition-transform"
            >
              完成训练
            </button>
          </motion.div>
        )}

        {/* 完成阶段 */}
        {phase === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-8"
          >
            {/* 庆祝动画 */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-center pt-8 pb-6"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-24 h-24 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
              >
                <Trophy size={48} className="text-yellow-700" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">太棒了！</h2>
              <p className="text-white/70">训练完成，{currentPet.name}又进步了</p>
            </motion.div>

            {/* 统计 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatTime(seconds)}</p>
                  <p className="text-white/70 text-sm mt-1">训练时长</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{rewardCount}</p>
                  <p className="text-white/70 text-sm mt-1">奖励次数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-300">{course.steps.length}</p>
                  <p className="text-white/70 text-sm mt-1">完成步骤</p>
                </div>
              </div>
            </motion.div>

            {/* 评分 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6"
            >
              <h3 className="font-medium mb-3">训练效果评分</h3>
              <div className="flex justify-center">
                <Rating value={rating} onChange={setRating} size={32} />
              </div>
            </motion.div>

            {/* 备注 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6"
            >
              <h3 className="font-medium mb-3">训练备注</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录今天的训练表现..."
                className="w-full h-24 p-3 bg-white/10 rounded-xl border border-white/20 placeholder:text-white/40 text-white resize-none focus:outline-none focus:border-white/40"
              />
              
              {behaviorList.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-white/70 mb-2">异常行为：</p>
                  <div className="flex flex-wrap gap-2">
                    {behaviorList.map((behavior, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-500/30 rounded-full text-sm flex items-center gap-1"
                      >
                        {behavior}
                        <button
                          onClick={() => handleRemoveBehavior(index)}
                          className="ml-1"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* 保存按钮 */}
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleComplete}
              className="w-full py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Check size={22} />
              保存打卡
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 异常行为弹窗 */}
      <AnimatePresence>
        {showBehaviorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowBehaviorModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 safe-area-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800 mb-4">记录异常行为</h3>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={behaviorText}
                  onChange={(e) => setBehaviorText(e.target.value)}
                  placeholder="输入行为描述..."
                  className="flex-1 px-4 py-3 bg-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBehavior()}
                />
                <button
                  onClick={handleAddBehavior}
                  className="px-5 py-3 bg-primary-500 text-white rounded-xl font-medium"
                >
                  添加
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">快速选择：</p>
                <div className="flex flex-wrap gap-2">
                  {['分心', '不配合', '乱叫', '咬人', '乱尿', '害怕'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        if (!behaviorList.includes(item)) {
                          setBehaviorList([...behaviorList, item]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        behaviorList.includes(item)
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {behaviorList.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-2">已记录：</p>
                  <div className="flex flex-wrap gap-2">
                    {behaviorList.map((behavior, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm flex items-center gap-1"
                      >
                        {behavior}
                        <button
                          onClick={() => handleRemoveBehavior(index)}
                          className="ml-1"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowBehaviorModal(false)}
                className="w-full py-3 bg-neutral-100 text-neutral-600 rounded-xl font-medium"
              >
                完成
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainingPage;
