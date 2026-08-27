import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDraft from './pages/CreateDraft';
import DraftDetail from './pages/DraftDetail';
import DraftRoom from './pages/DraftRoom';
import DraftReview from './pages/DraftReview';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/new"
          element={
            <RequireAuth>
              <CreateDraft />
            </RequireAuth>
          }
        />
        <Route
          path="/draft/:draftId"
          element={
            <RequireAuth>
              <DraftDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/draft/:draftId/room"
          element={
            <RequireAuth>
              <DraftRoom />
            </RequireAuth>
          }
        />
        <Route
          path="/draft/:draftId/review"
          element={
            <RequireAuth>
              <DraftReview />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
