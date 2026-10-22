import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlayersList from './pages/PlayersList';
import PlayerDetail from './pages/PlayerDetail';
import TrainingSessionsList from './pages/TrainingSessionsList';
import SessionDetail from './pages/SessionDetail';
import AttendancePage from './pages/AttendancePage';
import EvaluationsPage from './pages/EvaluationsPage';
import CoachesManagement from './pages/CoachesManagement';
import AcademySettings from './pages/AcademySettings';
import NotFound from './pages/NotFound';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Manager Only Route Guard
function ManagerRoute({ children }) {
  const { user, loading, isManager } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isManager) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Main App Layout
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 p-4 sm:p-8 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PlayersList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/players/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PlayerDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TrainingSessionsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SessionDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluations"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EvaluationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager Only Routes */}
          <Route
            path="/coaches"
            element={
              <ManagerRoute>
                <AppLayout>
                  <CoachesManagement />
                </AppLayout>
              </ManagerRoute>
            }
          />

          <Route
            path="/academy"
            element={
              <ManagerRoute>
                <AppLayout>
                  <AcademySettings />
                </AppLayout>
              </ManagerRoute>
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotFound />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
