interface RecentItem {
  id: number;
  title: string;
  type: 'task' | 'bookmark' | 'note';
  areaId?: number;
  createdAt: number; // timestamp
}

interface RecentItemsProps {
  recentItems: RecentItem[];
}

const RecentItems = ({ recentItems }: RecentItemsProps) => {
  // Sort by creation date (newest first)
  const sortedItems = [...recentItems].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  if (sortedItems.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-xl font-bold mb-4">Recent Items</h2>
        <p className="text-gray-500">No recent items yet.</p>
      </div>
    );
  }
  
  // Type icons and colors
  const getItemConfig = (type: string) => {
    switch (type) {
      case 'task': return { icon: 'list-task', color: '#3B82F6' };
      case 'bookmark': return { icon: 'bookmark', color: '#10B981' };
      case 'note': return { icon: 'note', color: '#8B5CF6' };
      default: return { icon: 'description', color: '#6B7280' };
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Recent Items</h2>
      <div className="space-y-3">
        {sortedItems.slice(0, 10).map(item => {
          const { icon, color } = getItemConfig(item.type);
          return (
            <div key={item.id} className="border-l-4 pl-3" 
                 style={{ borderLeftColor: color }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full`} 
                    style={{ backgroundColor: color }}
                  ></div>
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {/* Format date/time */}
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-xs rounded 
                          bg-gray-100 text-gray-800">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                {item.areaId && (
                  <span className="px-2 py-0.5 text-xs rounded 
                          bg-gray-100 text-gray-800">
                    Area {item.areaId}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {sortedItems.length > 10 && (
          <div className="text-center text-sm text-gray-500 mt-3">
            +{sortedItems.length - 10} more recent items
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentItems;
