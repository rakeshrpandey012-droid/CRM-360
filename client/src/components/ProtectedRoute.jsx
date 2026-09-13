import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('crm360_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('crm360_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 max-w-md">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Your account role ({user.role}) does not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
      />
      
      <div
        className={`flex flex-col flex-1 w-0 overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
