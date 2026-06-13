import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Camera, ChevronDown, ChevronUp, Star, User, X, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePetStore } from '../stores/usePetStore';
import { useTrainingStore } from '../stores/useTrainingStore';
import type { PhotoRecord } from '../types';

const PhotoAlbumPage = () => {
  const navigate = useNavigate();
  const { pets, currentPetId, setCurrentPet, getCurrentPet, getMemberById } = usePetStore();
  const { getPhotoAlbum, courses } = useTrainingStore();
  
  const currentPet = getCurrentPet();
  const photoAlbum = currentPet ? getPhotoAlbum(currentPet.id) : [];
  
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(
    photoAlbum.length > 0 ? photoAlbum[0].courseId : null
  );
  const [previewPhoto, setPreviewPhoto] = useState<PhotoRecord | null>(null);
  const [showPetDropdown, setShowPetDropdown] = useState(false);

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

  const toggleCourse = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  const hasPhotos = photoAlbum.length > 0;

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
          <h1 className="text-lg font-bold text-neutral-800">训练成长相册</h1>
          
          {/* 宠物切换下拉 */}
          <div className="relative">
            <button
              onClick={() => setShowPetDropdown(!showPetDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-card active:scale-95 transition-transform"
            >
              <img 
                src={currentPet?.avatar} 
                alt={currentPet?.name} 
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-neutral-700">{currentPet?.name}</span>
              <ChevronDown size={14} className="text-neutral-500" />
            </button>
            
            <AnimatePresence>
              {showPetDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-40 bg-white rounded-2xl shadow-lg overflow-hidden z-40"
                >
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setCurrentPet(pet.id);
                        setShowPetDropdown(false);
                        setExpandedCourseId(null);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${
                        pet.id === currentPetId ? 'bg-primary-50' : ''
                      }`}
                    >
                      <img 
                        src={pet.avatar} 
                        alt={pet.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className={`text-sm font-medium ${
                        pet.id === currentPetId ? 'text-primary-600' : 'text-neutral-700'
                      }`}>
                        {pet.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-4">
        {hasPhotos ? (
          <div className="space-y-4 mt-4">
            {photoAlbum.map((group, groupIndex) => {
              const isExpanded = expandedCourseId === group.courseId;
              const course = courses.find(c => c.id === group.courseId);
              
              return (
                <motion.div
                  key={group.courseId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  {/* 课程头部 */}
                  <button
                    onClick={() => toggleCourse(group.courseId)}
                    className="w-full p-5 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                      {course?.image ? (
                        <img 
                          src={course.image} 
                          alt={group.courseTitle} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera size={24} className="text-neutral-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-neutral-800">{group.courseTitle}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Camera size={12} />
                          {group.trainingCount} 次训练
                        </span>
                        <span className="text-xs text-neutral-400">
                          {format(new Date(group.earliestDate), 'M月d日', { locale: zhCN })} - {format(new Date(group.latestDate), 'M月d日', { locale: zhCN })}
                        </span>
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-neutral-400" />
                    </motion.div>
                  </button>
                  
                  {/* 展开的记录列表 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-6">
                          {group.records.map((record, recordIndex) => {
                            const member = record.completedBy ? getMemberById(record.completedBy) : undefined;
                            
                            return (
                              <motion.div
                                key={record.recordId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: recordIndex * 0.05 }}
                                className="relative pl-8"
                              >
                                {/* 时间线 */}
                                <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-neutral-100" />
                                <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                                </div>
                                
                                {/* 记录信息 */}
                                <div className="bg-neutral-50 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-neutral-800">
                                        {format(new Date(record.date), 'yyyy年M月d日', { locale: zhCN })}
                                      </span>
                                      <span className="text-xs text-neutral-400">
                                        第{recordIndex + 1}次训练
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                      <span className="text-sm font-medium text-neutral-700">{record.rating}</span>
                                    </div>
                                  </div>
                                  
                                  {member && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ backgroundColor: member.color }}
                                      >
                                        {member.name.charAt(0)}
                                      </div>
                                      <span className="text-xs text-neutral-500">
                                        由 {member.name} 完成
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* 照片网格 */}
                                  <div className="grid grid-cols-3 gap-2">
                                    {record.photos.map((photo) => (
                                      <motion.button
                                        key={photo.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setPreviewPhoto(photo)}
                                        className="relative aspect-square rounded-lg overflow-hidden"
                                      >
                                        <img
                                          src={photo.url}
                                          alt={photo.caption || photoLabelText[photo.label]}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-xs text-white font-medium ${photoLabelColors[photo.label]}`}>
                                          {photo.caption || photoLabelText[photo.label]}
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* 空状态 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-5">
              <Camera size={40} className="text-primary-300" />
            </div>
            <h3 className="text-lg font-bold text-neutral-700 mb-2">还没有训练照片</h3>
            <p className="text-neutral-400 text-sm mb-6">去训练时记录下宠物的成长瞬间吧</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
            >
              <BookOpen size={18} />
              去训练课程
            </motion.button>
          </motion.div>
        )}
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
              className="relative max-w-lg w-full"
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

      {/* 点击遮罩关闭下拉 */}
      {showPetDropdown && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowPetDropdown(false)}
        />
      )}
    </div>
  );
};

export default PhotoAlbumPage;
