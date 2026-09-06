import { useEffect, useState } from 'react';

const AreaList = () => {
  const [areas, setAreas] = useState<Array<{id: number; name: string; color: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch('/api/areas');
        if (!response.ok) {
          throw new Error('Failed to fetch areas');
        }
        const data = await response.json();
        setAreas(data);
      } catch (error) {
        console.error('Error fetching areas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading areas...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-sm font-medium text-gray-700 mb-2">Areas</h2>
      <div className="space-y-1">
        {areas.map(area => (
          <div 
            key={area.id} 
            className="flex items-center px-3 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            <div 
              className={`w-3 h-3 rounded-full mr-3 flex-shrink-0`} 
              style={{ backgroundColor: area.color }}
            ></div>
            <span className="text-sm text-gray-800 flex-1">{area.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaList;
