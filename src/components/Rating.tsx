import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const Rating = ({ 
  value, 
  max = 5, 
  size = 20, 
  onChange, 
  readonly = false 
}: RatingProps) => {
  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < value;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={readonly}
            className={`transition-transform ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-neutral-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
