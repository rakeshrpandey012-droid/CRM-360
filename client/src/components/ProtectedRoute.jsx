import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="p-8 text-center bg-white rounded-xl shadow-md border border-slate-200 max-w-md">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600">Your account role ({user.role}) does not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden lg:pl-64">
        <Navbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
