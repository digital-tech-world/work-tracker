import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AreaTable from '../components/areas/AreaTable';
import AreaForm from '../components/areas/AreaForm';
import Button from '../components/ui/Button';

const AreasPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [selectedArea, setSelectedArea] = useState(null);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  
  const { data: areas = [], isLoading, error } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('/api/areas');
      if (!response.ok) throw new Error('Failed to fetch areas');
      return response.json();
    }
  });
  
  const { mutate: createArea, isLoading: isCreating } = useMutation({
    mutationFn: async (newArea: Omit<Area, 'id' | 'createdAt'>) => {
      const response = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArea)
      });
      if (!response.ok) throw new Error('Failed to create area');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setIsAreaModalOpen(false);
    }
  });
  
  const { mutate: updateArea, isLoading: isUpdating } = useMutation({
    mutationFn: async (updatedArea: Area) => {
      const response = await fetch(`/api/areas/${updatedArea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArea)
      });
      if (!response.ok) throw new Error('Failed to update area');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setSelectedArea(null);
    }
  });
  
  const { mutate: deleteArea, isLoading: isDeleting } = useMutation({
    mutationFn: async (areaId: number) => {
      const response = await fetch(`/api/areas/${areaId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete area');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setSelectedArea(null);
    }
  });
  
  const handleCreateArea = () => {
    setSelectedArea(null);
    setIsAreaModalOpen(true);
  };
  
  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setIsAreaModalOpen(true);
  };
  
  const handleDeleteArea = (areaId: number) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      deleteArea(areaId);
    }
  };
  
  if (isLoading) return <div className="col-span-3 p-6">Loading areas...</div>;
  if (error) return <div className="col-span-3 p-6 text-red-500">Error: {(error as Error).message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Areas</h1>
        <Button 
          variant="primary" 
          onClick={handleCreateArea} 
          isLoading={isCreating}
        >
          New Area
        </Button>
      </div>
      
      <AreaTable 
        areas={areas} 
        onEdit={handleEditArea} 
        onDelete={handleDeleteArea}
      />
      
      <AreaForm 
        area={selectedArea} 
        isOpen={isAreaModalOpen} 
        onClose={() => setIsAreaModalOpen(false)}
        onSave={async (areaData: Omit<Area, 'id' | 'createdAt'>) => {
          if (selectedArea) {
            await updateArea({ ...selectedArea, ...areaData });
          } else {
            await createArea(areaData);
          }
        }} 
        isSaving={isUpdating || isCreating}
      />
    </div>
  );
};

export default AreasPage;
