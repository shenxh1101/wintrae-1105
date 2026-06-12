import { ReactNode } from 'react';
import TabBar from './TabBar';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

const PageLayout = ({ children, showTabBar = true }: PageLayoutProps) => {
  const location = useLocation();
  
  const fullscreenRoutes = ['/training/', '/weekly-review'];
  const isFullscreen = fullscreenRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-warm-50">
      <main 
        className={`pb-safe ${showTabBar && !isFullscreen ? 'pb-20' : ''}`}
      >
        {children}
      </main>
      {showTabBar && !isFullscreen && <TabBar />}
    </div>
  );
};

export default PageLayout;
