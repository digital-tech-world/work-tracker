import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import AreaList from './AreaList';
import Header from './Header';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 
                         transition-transform duration-300 ${sidebarOpen ? 'transform translate-x-0' : '-translate-x-full'}
                         z-50`}>
        <div className="flex h-full flex-col">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <nav className="mt-6 space-y-1 px-4">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium 
                transition-colors duration-150 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/tasks" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Tasks
            </NavLink>
            <NavLink 
              to="/bookmarks" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Bookmarks
            </NavLink>
            <NavLink 
              to="/notes" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Notes
            </NavLink>
            <NavLink 
              to="/areas" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Areas
            </NavLink>
            <NavLink 
              to="/docs" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Docs
            </NavLink>
            <NavLink 
              to="/search" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Search
            </NavLink>
            <NavLink 
              to="/daily-log" 
              className="flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150 
                text-gray-600 hover:bg-gray-50"
            >
              Daily Log
            </NavLink>
          </nav>
          
          {/* Area List */}
          <div className="mt-auto border-t border-gray-200">
            <AreaList />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 pl-[64px] ${!sidebarOpen ? 'pl-0' : ''} transition-all duration-300`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
