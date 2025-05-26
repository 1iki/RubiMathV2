import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedGameRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  // Check local storage first
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Allow access if either Supabase user or local auth is valid
  if (!user && !isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // Verifikasi role dan kelas
  if (!userData.id_kelas && !user?.id_kelas) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedGameRoute; 