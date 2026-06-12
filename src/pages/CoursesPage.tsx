import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useTrainingStore } from '../stores/useTrainingStore';
import CourseCard from '../components/CourseCard';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { courses, categories, activeCategory, setActiveCategory } = useTrainingStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allCategories = [
    { id: 'all', name: '全部', icon: 'Grid', color: 'primary' },
    ...categories,
  ];

  return (
    <div className="pb-6">
      <Header title="训练课程" />
      
      <div className="px-4">
        {/* 搜索框 */}
        <div className="relative mt-2">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索训练课程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-neutral-100 focus:border-primary-300 focus:outline-none transition-colors"
          />
        </div>

        {/* 分类标签 */}
        <div className="mt-4 overflow-x-auto hide-scrollbar -mx-4 px-4">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 课程列表 */}
        <motion.div layout className="mt-5">
          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <CourseCard
                      course={course}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Filter size={32} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500">没有找到相关课程</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-3 text-primary-500 font-medium text-sm"
                >
                  查看全部课程
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesPage;
