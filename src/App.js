import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import MultiStepForm from './components/MultiStepForm';
import SubmissionHistory from './components/SubmissionHistory'; // Add this import
import AdminPanel from './components/AdminPanel'; // If you still want this
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="form-container">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Personal Information Form Challenge</h1>
          </header>
          <main>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <MultiStepForm />
                </ProtectedRoute>
              } />
              <Route path="/submission-history" element={
                <ProtectedRoute>
                  <SubmissionHistory />
                </ProtectedRoute>
              } />
              {/* Keep admin panel if needed */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
