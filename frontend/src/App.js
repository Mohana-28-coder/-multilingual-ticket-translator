import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './components/Home';
import ClientAuth from './components/ClientAuth';
import AdminAuth from './components/AdminAuth';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import TicketDetail from './components/TicketDetail';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/client/login" element={<ClientAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ticket/:id" 
          element={
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;