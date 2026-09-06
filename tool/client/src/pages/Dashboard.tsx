import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import TasksByArea from '../components/dashboard/TasksByArea';
import OverdueTasks from '../components/dashboard/OverdueTasks';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentItems from '../components/dashboard/RecentItems';
import AIWorkSummaryButton from '../components/dashboard/AIWorkSummaryButton';

const DashboardPage = () => {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    }
  });
  
  // Fetch tasks for various components
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });
  
  // Fetch areas for tasks by area component
  const { data: areas = [], isLoading: areasLoading } = useQuery({ queryKey: ['dashboard', 'areas'], queryFn: async () => { const response = await fetch('/api/areas'); if (!response.ok) throw new Error('Failed to fetch areas'); return response.json(); } }); 
  
  // Fetch recent items for recent items component
  const { data: recentItems = [], isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent');
      if (!response.ok) throw new Error('Failed to fetch recent items');
      return response.json();
    }
  });
  
  if (statsLoading || tasksLoading || areasLoading || recentLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          <div className="col-span-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (statsError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-red-500">Error: {(statsError as Error).message}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <AIWorkSummaryButton 
            onGenerate={async () => {
              // In real app, this would call AI service to generate work summary
              alert('Generating work summary with AI...');
            }}
          />
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Tasks" 
            value={stats?.totalTasks || 0} 
            icon="list-task" 
            bgColor="bg-primary-50" 
            textColor="text-primary-600"
          />
          <StatCard 
            title="Open Tasks" 
            value={stats?.openTasks || 0} 
            icon="list-checks" 
            bgColor="bg-blue-50" 
            textColor="text-blue-600"
          />
          <StatCard 
            title="Overdue Tasks" 
            value={stats?.overdueTasks || 0} 
            icon="alert-triangle" 
            bgColor="bg-red-50" 
            textColor="text-red-600"
          />
          <StatCard 
            title="Bookmarks" 
            value={stats?.bookmarkCount || 0} 
            icon="bookmark" 
            bgColor="bg-green-50" 
            textColor="text-green-600"
          />
        </div>
        
        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <TasksByArea 
              tasks={tasks} 
              areas={[]} // Would be populated from areas query
            />
            
            <OverdueTasks 
              tasks={tasks} 
            />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingDeadlines 
              tasks={tasks} 
            />
            
            <RecentItems 
              recentItems={recentItems} 
            />
          </div>
        </div>
      </div>
    </div>
    );
};

export default DashboardPage;
