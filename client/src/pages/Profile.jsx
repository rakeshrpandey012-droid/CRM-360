import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../api/axios';
import { updateUserProfile } from '../store/authSlice';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [details, setDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [detailsMsg, setDetailsMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoadingDetails(true);
    setDetailsMsg({ type: '', text: '' });
    try {
      const res = await API.put('/auth/updatedetails', details);
      dispatch(updateUserProfile(res.data.data));
      setDetailsMsg({ type: 'success', text: 'Profile details updated successfully!' });
      toast.success('Profile Updated', 'Your profile details have been saved.');
    } catch (err) {
      setDetailsMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
      toast.error('Update Failed', err.response?.data?.message || 'Could not update profile');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mismatch', 'New passwords do not match.');
      return setPassMsg({ type: 'error', text: 'New passwords do not match' });
    }
    setLoadingPass(true);
    setPassMsg({ type: '', text: '' });
    try {
      await API.put('/auth/updatepassword', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      toast.success('Password Updated', 'Your account security credentials were updated.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
      toast.error('Security Update Failed', err.response?.data?.message || 'Could not update password');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal credentials, contact info, and security settings</p>
      </div>

      {/* User Info Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
              {user?.role}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Organization Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <User className="w-4 h-4 text-blue-600 mr-2" /> Personal Information
          </h3>

          {detailsMsg.text && (
            <div className={`p-3 rounded-xl text-xs mb-4 border ${
              detailsMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {detailsMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateDetails} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingDetails}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
            >
              {loadingDetails ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center">
            <Lock className="w-4 h-4 text-indigo-600 mr-2" /> Security & Password
          </h3>

          {passMsg.text && (
            <div className={`p-3 rounded-xl text-xs mb-4 border ${
              passMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPass}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              {loadingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
