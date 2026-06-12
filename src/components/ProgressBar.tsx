interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'primary',
  size = 'md',
  showLabel = false 
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    yellow: 'bg-yellow-400',
  };
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-600">进度</span>
          <span className="font-medium text-primary-600">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-neutral-100 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
