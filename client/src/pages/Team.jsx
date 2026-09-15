import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  ShieldCheck, Users, UserPlus, Check, X,
  Trash2, Mail, Phone, Building2, Lock, Shield, UserCog, AlertCircle, Sparkles
} from 'lucide-react';

const PERMISSIONS = [
  { module: 'User & Role Administration', admin: true, manager: false, exec: false },
  { module: 'Delete Records (Customers, Leads, Tasks)', admin: true, manager: true, exec: false },
  { module: 'Bulk Task & Lead Reassignment', admin: true, manager: true, exec: false },
  { module: 'Pipeline Stage Progression', admin: true, manager: true, exec: true },
  { module: 'Customer & Lead Management (Add, Edit, Notes)', admin: true, manager: true, exec: true },
  { module: 'Task Execution & Completion', admin: true, manager: true, exec: true },
  { module: 'Executive Revenue & Team Analytics', admin: true, manager: true, exec: false },
  { module: 'Personal Profile & Password Reset', admin: true, manager: true, exec: true },
];

const Team = () => {
  const toast = useToast();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'permissions'

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales Executive',
    department: 'Sales',
    phone: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success('Role Updated', `Permissions updated to ${newRole}.`);
    } catch (err) {
      toast.error('Permission Denied', err.response?.data?.message || 'Admin permissions required to update roles.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', formData);
      setShowAddModal(false);
      setFormData({
        name: '', email: '', password: '', role: 'Sales Executive',
        department: 'Sales', phone: ''
      });
      toast.success('User Added', `New team member "${formData.name}" onboarded successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error('Add Member Failed', err.response?.data?.message || 'Could not create user');
    }
  };

  const confirmDeleteUser = (member) => {
    setUserToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await API.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      toast.success('Member Removed', `${userToDelete.name} has been removed from organization.`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error('Remove Failed', err.response?.data?.message || 'Could not delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (role === 'Sales Manager') return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const managerCount = users.filter(u => u.role === 'Sales Manager').length;
  const execCount = users.filter(u => u.role === 'Sales Executive').length;

  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Sales Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Role-Based Access Control
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">• Multi-Tier Security</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team & Role Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage organization members, assign role permissions, and track sales team composition
          </p>
        </div>

        {(isAdmin || isManager) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
          </button>
        )}
      </div>

      {/* Role Counts Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">System Admins</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Full governance & deletion rights</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sales Managers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{managerCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Pipeline delegation & team analytics</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UserCog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sales Executives</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{execCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Lead conversion & daily task execution</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Team Roster ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Role Permissions Matrix
        </button>
      </div>

      {/* Tab 1: Team Roster Table */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Role Permission</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">ID: {member._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center text-slate-800 dark:text-slate-200">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {member.email}
                      </p>
                      {member.phone && (
                        <p className="flex items-center text-slate-400 dark:text-slate-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {member.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {member.department || 'Sales'}
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${getRoleBadge(member.role)}`}
                        >
                          <option value="Admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                          <option value="Sales Manager" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sales Manager</option>
                          <option value="Sales Executive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sales Executive</option>
                        </select>
                      ) : (
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && member._id !== currentUser?._id && (
                        <button
                          onClick={() => confirmDeleteUser(member)}
                          title="Remove user"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Role Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear breakdown of privileges and operational permissions by assigned user tier
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Functional Capability</th>
                  <th className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                      Admin
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      Sales Manager
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      Sales Executive
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {PERMISSIONS.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{perm.module}</td>
                    <td className="px-4 py-3 text-center">
                      {perm.admin ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {perm.manager ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {perm.exec ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Work Email *</label>
                <input
                  required
                  type="email"
                  placeholder="sarah@crm360.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Temporary Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Role Permission</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Sales"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${userToDelete?.name}" (${userToDelete?.role})? Their workspace access will be permanently revoked.`}
        confirmText="Remove Member"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Team;
