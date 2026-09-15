import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  CheckSquare,
  User,
  LogOut,
  ShieldCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, toggleCollapse }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Leads', path: '/leads', icon: Briefcase },
    { name: 'Sales Pipeline', path: '/pipeline', icon: GitPullRequest },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Team & Roles', path: '/team', icon: ShieldCheck },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const getRoleBadge = (role) => {
    if (role === 'Admin') return 'bg-purple-900/60 text-purple-300 border-purple-700/50';
    if (role === 'Sales Manager') return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
    return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/25 shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="truncate transition-opacity duration-200">
                <span className="text-xl font-black tracking-tight text-white">CRM<span className="text-blue-500">360</span></span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">Enterprise SaaS</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {(!collapsed || mobileOpen) && (
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed && !mobileOpen ? item.name : undefined}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center ${collapsed && !mobileOpen ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 ${collapsed && !mobileOpen ? '' : 'mr-3'}`} />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          {(!collapsed || mobileOpen) ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 truncate">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-blue-400 font-bold border border-slate-700 shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'CRM User'}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium border ${getRoleBadge(user?.role)}`}>
                      {user?.role || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl hover:bg-rose-900/60 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div
                title={`${user?.name || 'User'} (${user?.role || 'Role'})`}
                className="w-10 h-10 rounded-full bg-slate-800 text-blue-400 font-bold flex items-center justify-center text-sm border border-slate-700"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-rose-300 hover:text-white hover:bg-rose-900/50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
