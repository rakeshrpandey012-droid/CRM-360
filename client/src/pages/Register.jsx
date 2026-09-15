import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearAuthError } from '../store/authSlice';
import { Briefcase, Mail, Lock, User, Phone, ArrowRight, Check } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const passwordVal = watch('password', '');

  const hasLength = passwordVal.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordVal);
  const hasNumber = /\d/.test(passwordVal);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordVal);

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full space-y-6 bg-slate-900/90 p-7 sm:p-9 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-blue-500/25 mb-3.5 ring-1 ring-white/20">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create CRM360 Account</h1>
          <p className="mt-1 text-xs text-slate-400 font-medium">Join your organization sales workspace</p>
        </div>

        {error && (
          <div className="p-3.5 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-xl">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                type="text"
                placeholder="John Doe"
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, message: 'Invalid email address' }
                })}
                type="email"
                placeholder="john@company.com"
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Role
              </label>
              <select
                {...register('role')}
                defaultValue="Sales Executive"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Sales Executive">Sales Executive</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Phone (Optional)
              </label>
              <input
                {...register('phone')}
                type="text"
                placeholder="+1 555-0100"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('password', {
                  required: 'Password is required',
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                    message: 'Does not meet strength criteria'
                  }
                })}
                type="password"
                placeholder="Min 8 chars, 1 upper, 1 num, 1 symbol"
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password strength checklist */}
            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-400">
              <span className={`flex items-center ${hasLength ? 'text-emerald-400' : ''}`}>
                <Check className={`w-3 h-3 mr-1 ${hasLength ? 'text-emerald-400' : 'text-slate-600'}`} /> 8+ Characters
              </span>
              <span className={`flex items-center ${hasUpper ? 'text-emerald-400' : ''}`}>
                <Check className={`w-3 h-3 mr-1 ${hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} /> 1 Uppercase
              </span>
              <span className={`flex items-center ${hasNumber ? 'text-emerald-400' : ''}`}>
                <Check className={`w-3 h-3 mr-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} /> 1 Number
              </span>
              <span className={`flex items-center ${hasSpecial ? 'text-emerald-400' : ''}`}>
                <Check className={`w-3 h-3 mr-1 ${hasSpecial ? 'text-emerald-400' : 'text-slate-600'}`} /> 1 Special Symbol
              </span>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
