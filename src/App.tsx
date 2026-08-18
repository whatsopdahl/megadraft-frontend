import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import DraftPicker from './pages/DraftPicker';
import DraftRoom from './pages/DraftRoom';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={isAuthenticated ? <DraftPicker /> : <Login />}
        />
        <Route
          path="/draft/:draftId"
          element={isAuthenticated ? <DraftRoom /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
