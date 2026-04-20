import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/hr/*" 
          element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/accountant/*" 
          element={
            <ProtectedRoute allowedRoles={['Accountant']}>
              <AccountantDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employee/*" 
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
