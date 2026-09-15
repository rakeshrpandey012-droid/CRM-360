import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from '../store/authSlice';
import { Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = async (roleName, email, password) => {
    setActiveDemo(roleName);
    setValue('email', email);
    setValue('password', password);
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email, password }));
    setActiveDemo(null);
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full space-y-7 bg-slate-900/90 p-7 sm:p-9 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-blue-500/25 mb-3.5 ring-1 ring-white/20">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CRM<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">360</span>
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">
            SaaS Customer Relationship Management Platform
          </p>
        </div>

        {/* 1-Click Demo Accounts Selector */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Role Login</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Demo Sandbox</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('Admin', 'admin@crm360.com', 'Password@123')}
              className="group p-2 text-left bg-purple-950/30 hover:bg-purple-900/50 border border-purple-800/40 hover:border-purple-600/60 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">👑 Admin</span>
                {activeDemo === 'Admin' && <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />}
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-purple-200 truncate mt-0.5">Full System</p>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('Manager', 'manager@crm360.com', 'Password@123')}
              className="group p-2 text-left bg-blue-950/30 hover:bg-blue-900/50 border border-blue-800/40 hover:border-blue-600/60 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300">💼 Manager</span>
                {activeDemo === 'Manager' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-blue-200 truncate mt-0.5">Pipeline Leads</p>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('Executive', 'sales@crm360.com', 'Password@123')}
              className="group p-2 text-left bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 hover:border-emerald-600/60 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">🎯 Sales Exec</span>
                {activeDemo === 'Executive' && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-emerald-200 truncate mt-0.5">Deals & Tasks</p>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Verify credentials or click any of the 1-click demo role accounts above.
              </p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('email', {
                  required: 'Email address is required',
                  pattern: { value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, message: 'Invalid email format' }
                })}
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition duration-150 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in to CRM360...
              </span>
            ) : (
              <span className="flex items-center">
                Sign In to Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Need a new workspace account?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
