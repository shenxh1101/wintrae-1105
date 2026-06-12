import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Zap, AlertCircle, CheckCircle, Play, ChevronLeft, Share2
} from 'lucide-react';
import { useTrainingStore } from '../stores/useTrainingStore';
import { motion } from 'framer-motion';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById } = useTrainingStore();
  const course = getCourseById(id || '');

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">课程不存在</p>
      </div>
    );
  }

  const difficultyText = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  const difficultyColor = {
    easy: 'bg-green-100 text-green-600',
    medium: 'bg-yellow-100 text-yellow-600',
    hard: 'bg-red-100 text-red-600',
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-8">
      {/* 顶部图片 */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        
        {/* 分享按钮 */}
        <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
          <Share2 size={18} className="text-neutral-700" />
        </button>

        {/* 标题 */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor[course.difficulty]}`}>
              {difficultyText[course.difficulty]}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {/* 信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-card p-5"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              <span className="text-neutral-600">{course.durationMin}分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              <span className="text-neutral-600">{course.steps.length}个步骤</span>
            </div>
          </div>
          
          <p className="mt-4 text-neutral-600 leading-relaxed">
            {course.description}
          </p>
        </motion.div>

        {/* 分步说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-neutral-800 mb-4">训练步骤</h2>
          <div className="space-y-4">
            {course.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-neutral-700 leading-relaxed">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 训练技巧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h2 className="text-lg font-bold text-neutral-800 mb-4">训练技巧</h2>
          <div className="bg-secondary-50 rounded-2xl p-5">
            <div className="space-y-3">
              {course.tips.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <CheckCircle size={18} className="text-secondary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 注意事项 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="bg-yellow-50 rounded-2xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-700">注意事项</p>
              <p className="text-sm text-yellow-600 mt-1">
                训练时请注意宠物的状态，如果宠物表现出疲惫或抗拒，请及时休息。保持耐心，循序渐进。
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部开始按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 safe-area-bottom z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate(`/training/${course.id}`)}
            className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            <Play size={22} fill="white" />
            开始训练
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
