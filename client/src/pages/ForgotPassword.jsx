import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-950/80 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="mt-1 text-xs text-slate-400">Enter your email to receive recovery instructions</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-xl">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300">
              Password reset link generated for <strong className="text-white">{email}</strong>.
            </p>
            {resetToken && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left">
                <p className="text-xs font-semibold text-slate-400 mb-1">Development Demo Reset Link:</p>
                <Link
                  to={`/reset-password/${resetToken}`}
                  className="text-xs text-blue-400 font-mono break-all hover:underline"
                >
                  /reset-password/{resetToken}
                </Link>
              </div>
            )}
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crm360.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/25"
            >
              {loading ? 'Sending Request...' : 'Send Reset Instructions'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
