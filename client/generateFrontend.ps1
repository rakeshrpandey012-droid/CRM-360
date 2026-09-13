mkdir -Force src\components, src\pages, src\store, src\hooks, src\utils, src\services, src\features
# store.js
$store = @'
import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
  reducer: {
    // Add reducers here later
  },
});
'@
Set-Content -Path .\src\store\store.js -Value $store -Encoding UTF8

# main.jsx (Setup Redux and Router)
$main = @'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
'@
Set-Content -Path .\src\main.jsx -Value $main -Encoding UTF8

# Login.jsx
$login = @'
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    // Fake login
    localStorage.setItem('token', 'fake-jwt-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to CRM360</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input {...register('email')} type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address" />
            </div>
            <div>
              <input {...register('password')} type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
'@
Set-Content -Path .\src\pages\Login.jsx -Value $login -Encoding UTF8

# Dashboard.jsx
$dashboard = @'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, activeLeads: 0, pendingTasks: 0, revenue: 0 });

  useEffect(() => {
    // Fetch stats
    setStats({ totalCustomers: 120, activeLeads: 45, pendingTasks: 12, revenue: 50000 });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Leads</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900"></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
'@
Set-Content -Path .\src\pages\Dashboard.jsx -Value $dashboard -Encoding UTF8

# Sidebar.jsx
$sidebar = @'
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-800">CRM360</div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-800">Dashboard</Link>
        <Link to="/customers" className="block py-2 px-4 rounded hover:bg-gray-800">Customers</Link>
        <Link to="/leads" className="block py-2 px-4 rounded hover:bg-gray-800">Leads Pipeline</Link>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={handleLogout} className="w-full text-left py-2 px-4 hover:bg-gray-800 rounded">Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
'@
Set-Content -Path .\src\components\Sidebar.jsx -Value $sidebar -Encoding UTF8

# App.jsx
$app = @'
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><div className="p-6">Customers Page (WIP)</div></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><div className="p-6">Leads Kanban Page (WIP)</div></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
'@
Set-Content -Path .\src\App.jsx -Value $app -Encoding UTF8
