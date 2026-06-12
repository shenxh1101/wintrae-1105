import { Clock, Zap } from 'lucide-react';
import type { TrainingCourse } from '../types';

interface CourseCardProps {
  course: TrainingCourse;
  onClick?: () => void;
  progress?: number;
}

const CourseCard = ({ course, onClick, progress }: CourseCardProps) => {
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
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-float transition-all duration-300 cursor-pointer active:scale-[0.98]"
    >
      <div className="relative h-32 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor[course.difficulty]}`}>
            {difficultyText[course.difficulty]}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-neutral-800">{course.title}</h3>
        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.durationMin}分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-yellow-500" />
            <span>{course.steps.length}步</span>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-500">训练进度</span>
              <span className="text-primary-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
