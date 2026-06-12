import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calendar, PawPrint, Bell } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/courses', icon: BookOpen, label: '课程' },
  { path: '/records', icon: Calendar, label: '记录' },
  { path: '/pets', icon: PawPrint, label: '宠物' },
  { path: '/reminders', icon: Bell, label: '提醒' },
];

const TabBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-primary-50 scale-110' : ''
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
