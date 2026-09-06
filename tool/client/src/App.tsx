import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Bookmarks from './pages/Bookmarks';
import Notes from './pages/Notes';
import Areas from './pages/Areas';
import AreaDetail from './pages/AreaDetail';
import Docs from './pages/Docs';
import Search from './pages/Search';
import DailyLog from './pages/DailyLog';
import ChatPanel from './components/layout/ChatPanel';

// Create a client instance shared across the whole app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<Navigate replace to="/tasks" />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/bookmarks/:id" element={<Navigate replace to="/bookmarks" />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:id" element={<Navigate replace to="/notes" />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/areas/:id" element={<AreaDetail />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/search" element={<Search />} />
              <Route path="/daily-log" element={<DailyLog />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </Layout>
          <ChatPanel />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
