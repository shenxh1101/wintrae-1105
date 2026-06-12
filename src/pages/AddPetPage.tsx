import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, PawPrint } from 'lucide-react';
import { usePetStore } from '../stores/usePetStore';
import { motion } from 'framer-motion';

const AddPetPage = () => {
  const navigate = useNavigate();
  const { addPet } = usePetStore();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as 'dog' | 'cat',
    breed: '',
    ageMonths: '',
    weightKg: '',
    gender: 'male' as 'male' | 'female',
    avatar: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入宠物名字');
      return;
    }

    const defaultAvatar = formData.type === 'dog'
      ? 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20puppy%20dog%20portrait%20warm%20friendly&image_size=square'
      : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20kitten%20cat%20portrait%20fluffy&image_size=square';

    addPet({
      name: formData.name.trim(),
      type: formData.type,
      breed: formData.breed.trim() || (formData.type === 'dog' ? '中华田园犬' : '家猫'),
      ageMonths: parseInt(formData.ageMonths) || 6,
      weightKg: parseFloat(formData.weightKg) || 5,
      gender: formData.gender,
      avatar: formData.avatar || defaultAvatar,
    });

    navigate('/pets');
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-8">
      {/* 顶部 */}
      <div className="bg-white">
        <div className="flex items-center h-14 px-4 safe-area-top">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={24} className="text-neutral-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-neutral-800 -ml-8">
            添加宠物
          </h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* 头像上传 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white border-4 border-primary-100 flex items-center justify-center overflow-hidden shadow-card">
              {formData.avatar ? (
                <img src={formData.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={40} className="text-primary-200" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <Camera size={18} className="text-white" />
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-3">点击设置头像</p>
        </motion.div>

        {/* 宠物类型 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label className="text-sm font-medium text-neutral-700 mb-3 block">
            宠物类型
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleChange('type', 'dog')}
              className={`flex-1 py-4 rounded-2xl font-medium transition-all ${
                formData.type === 'dog'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-white text-neutral-600 border-2 border-neutral-100'
              }`}
            >
              🐕 狗狗
            </button>
            <button
              onClick={() => handleChange('type', 'cat')}
              className={`flex-1 py-4 rounded-2xl font-medium transition-all ${
                formData.type === 'cat'
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-white text-neutral-600 border-2 border-neutral-100'
              }`}
            >
              🐱 猫咪
            </button>
          </div>
        </motion.div>

        {/* 基本信息表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              名字 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="给宠物起个名字"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              品种
            </label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => handleChange('breed', e.target.value)}
              placeholder={formData.type === 'dog' ? '如：金毛、泰迪...' : '如：英短、布偶...'}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                年龄（月）
              </label>
              <input
                type="number"
                value={formData.ageMonths}
                onChange={(e) => handleChange('ageMonths', e.target.value)}
                placeholder="6"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                体重（kg）
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weightKg}
                onChange={(e) => handleChange('weightKg', e.target.value)}
                placeholder="5.0"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-3 block">
              性别
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleChange('gender', 'male')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  formData.gender === 'male'
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                    : 'bg-white text-neutral-500 border-2 border-neutral-100'
                }`}
              >
                <span>♂</span> 公
              </button>
              <button
                onClick={() => handleChange('gender', 'female')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  formData.gender === 'female'
                    ? 'bg-pink-50 text-pink-600 border-2 border-pink-200'
                    : 'bg-white text-neutral-500 border-2 border-neutral-100'
                }`}
              >
                <span>♀</span> 母
              </button>
            </div>
          </div>
        </motion.div>

        {/* 保存按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <button
            onClick={handleSubmit}
            className="w-full btn-primary py-4 text-lg font-bold"
          >
            保存宠物档案
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AddPetPage;
