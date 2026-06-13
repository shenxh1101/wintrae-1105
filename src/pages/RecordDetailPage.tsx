import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Star, Gift, AlertTriangle, Camera, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrainingStore } from '../stores/useTrainingStore';
import { usePetStore } from '../stores/usePetStore';
import Rating from '../components/Rating';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { PhotoRecord } from '../types';

const RecordDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecordById, courses } = useTrainingStore();
  const { getMemberById, pets } = usePetStore();
  const [previewPhoto, setPreviewPhoto] = useState<PhotoRecord | null>(null);

  const record = getRecordById(id || '');
  const course = courses.find(c => c.id === record?.courseId);
  const member = record?.completedBy ? getMemberById(record.completedBy) : undefined;
  const pet = record ? pets.find(p => p.id === record.petId) : undefined;

  const photoLabelColors = {
    before: 'bg-blue-500',
    after: 'bg-green-500',
    progress: 'bg-purple-500',
  };

  const photoLabelText = {
    before: '训练前',
    after: '训练后',
    progress: '阶段性',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs > 0 ? secs + '秒' : '钟'}`;
    }
    return `${secs}秒`;
  };

  const totalRewards = record?.rewards.reduce((sum, r) => sum + r.count, 0) || 0;
  const abnormalCount = record?.behaviorNotes.filter(b => b.isAbnormal).length || 0;

  if (!record) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <p className="text-neutral-500">记录不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-12">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-30 bg-warm-50/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3 safe-area-top">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-card active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} className="text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">训练详情</h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="px-4">
        {/* 头部卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-3xl p-5 text-white shadow-lg mb-5 overflow-hidden relative"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur overflow-hidden border-2 border-white/30">
                {pet?.avatar ? (
                  <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={28} className="text-white/80" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm">{pet?.name || '未知宠物'}</p>
                <h2 className="text-xl font-bold mt-0.5">{course?.title || '训练课程'}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2">
                <Rating value={record.rating} size={16} readonly />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <Clock size={14} />
                {format(new Date(record.date), 'yyyy年M月d日 EEEE', { locale: zhCN })}
              </div>
              {member && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-sm text-white/90" style={{ color: member.color }}>
                    {member.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="bg-white rounded-2xl p-4 text-center shadow-card">
            <div className="w-10 h-10 mx-auto rounded-xl bg-primary-100 flex items-center justify-center mb-2">
              <Clock size={18} className="text-primary-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{formatDuration(record.durationSeconds)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">训练时长</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-card">
            <div className="w-10 h-10 mx-auto rounded-xl bg-yellow-100 flex items-center justify-center mb-2">
              <Gift size={18} className="text-yellow-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{totalRewards}</p>
            <p className="text-xs text-neutral-500 mt-0.5">奖励次数</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-card">
            <div className="w-10 h-10 mx-auto rounded-xl bg-red-100 flex items-center justify-center mb-2">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <p className="text-xl font-bold text-neutral-800">{abnormalCount}</p>
            <p className="text-xs text-neutral-500 mt-0.5">异常行为</p>
          </div>
        </motion.div>

        {/* 异常行为列表 */}
        {record.behaviorNotes && record.behaviorNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-card mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <h3 className="font-bold text-neutral-800">异常行为记录</h3>
            </div>
            <div className="space-y-2">
              {record.behaviorNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-3 p-3 bg-red-50 rounded-xl"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-red-700">{note.behavior}</p>
                    {note.description && note.description !== note.behavior && (
                      <p className="text-sm text-red-500 mt-0.5">{note.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 照片对比区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-card mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
              <Camera size={16} className="text-secondary-500" />
            </div>
            <h3 className="font-bold text-neutral-800">训练照片记录</h3>
            {record.photos && record.photos.length > 0 && (
              <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                共{record.photos.length}张
              </span>
            )}
            <button
              onClick={() => navigate('/photo-album')}
              className="ml-auto text-xs text-primary-500 font-medium flex items-center gap-0.5 hover:text-primary-600 transition-colors"
            >
              查看相册
              <ChevronRight size={14} />
            </button>
          </div>

          {record.photos && record.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {record.photos.map((photo) => (
                <motion.button
                  key={photo.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPreviewPhoto(photo)}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || photoLabelText[photo.label]}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-xs text-white font-medium ${photoLabelColors[photo.label]}`}>
                    {photo.caption || photoLabelText[photo.label]}
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <Camera size={24} className="text-neutral-300" />
              </div>
              <p className="text-neutral-400 text-sm">本次训练没有记录照片</p>
            </div>
          )}
        </motion.div>

        {/* 训练备注 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-card mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star size={16} className="text-yellow-500" />
            </div>
            <h3 className="font-bold text-neutral-800">训练备注</h3>
          </div>
          {record.notes ? (
            <div className="bg-warm-50 rounded-xl p-4">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{record.notes}</p>
            </div>
          ) : (
            <p className="text-neutral-400 text-sm py-2">暂无备注</p>
          )}
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center pt-2 pb-6"
        >
          <div className="inline-flex items-center gap-1 text-xs text-neutral-300">
            <Star size={12} className="fill-neutral-200" />
            <span>每一次训练都是爱的陪伴</span>
            <Star size={12} className="fill-neutral-200" />
          </div>
        </motion.div>
      </div>

      {/* 照片预览弹窗 */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || photoLabelText[previewPhoto.label]}
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm text-white font-medium ${photoLabelColors[previewPhoto.label]}`}>
                  {previewPhoto.caption || photoLabelText[previewPhoto.label]}
                </span>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordDetailPage;
