import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <button onClick={onToggleSidebar} className="p-2 rounded hover:bg-gray-100">
          <span className="material-icons">menu</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Work Tracker</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Search bar with Ctrl+K shortcut */}
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search (Ctrl+K)..." 
            className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span className="material-icons">search</span>
          </span>
        </div>
        
        {/* Theme toggle */}
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded hover:bg-gray-100">
          {isDarkMode ? <Sun /> : <Moon />}
        </button>
        
        {/* Chat toggle button */}
        <button className="p-2 rounded hover:bg-gray-100">
          <span className="material-icons">chat_bubble</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
