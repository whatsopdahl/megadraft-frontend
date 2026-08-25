import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDraft from './pages/CreateDraft';
import JoinDraft from './pages/JoinDraft';
import DraftDetail from './pages/DraftDetail';
import DraftRoom from './pages/DraftRoom';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login />} />
        <Route
          path="/new"
          element={
            <RequireAuth>
              <CreateDraft />
            </RequireAuth>
          }
        />
        <Route
          path="/join"
          element={
            <RequireAuth>
              <JoinDraft />
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
      </Routes>
    </Router>
  );
};

export default App;
