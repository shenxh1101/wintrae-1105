import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const Header = ({ 
  title, 
  showBack = false, 
  rightAction,
  transparent = false 
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header 
      className={`sticky top-0 z-40 safe-area-top ${
        transparent 
          ? 'bg-transparent' 
          : 'bg-white/80 backdrop-blur-md border-b border-neutral-100'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
            >
              <ChevronLeft size={24} className="text-neutral-700" />
            </button>
          )}
        </div>
        
        <h1 className={`text-lg font-semibold ${transparent ? 'text-white' : 'text-neutral-800'}`}>
          {title}
        </h1>
        
        <div className="flex items-center">
          {rightAction || (
            <div className="w-10" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
