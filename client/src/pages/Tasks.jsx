import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  CheckSquare, Plus, Search, CheckCircle2, Clock, AlertCircle,
  Trash2, User, Calendar, X, Users, ArrowRight, Filter
} from 'lucide-react';

const Tasks = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium',
    dueDate: '', assignedTo: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [taskRes, userRes] = await Promise.all([
        API.get('/tasks', {
          params: { status: statusFilter, priority: priorityFilter }
        }),
        API.get('/users')
      ]);
      setTasks(taskRes.data.data || []);
      setUsers(userRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load tasks', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Todo' ? 'In Progress' : task.status === 'In Progress' ? 'Completed' : 'Todo';
    try {
      const res = await API.put(`/tasks/${task._id}/status`, { status: nextStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data.data : t)));
      toast.success('Task Status Updated', `"${task.title}" is now marked as ${nextStatus}.`);
    } catch (err) {
      toast.error('Status Update Failed', err.response?.data?.message || 'Could not update task status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', formData);
      setShowAddModal(false);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', assignedTo: '' });
      toast.success('Task Created', 'New task added to the schedule.');
      fetchTasks();
    } catch (err) {
      toast.error('Create Task Failed', err.response?.data?.message || 'Could not create task');
    }
  };

  const confirmDeleteTask = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await API.delete(`/tasks/${taskToDelete._id}`);
      setTasks(tasks.filter((t) => t._id !== taskToDelete._id));
      toast.success('Task Deleted', `"${taskToDelete.title}" was removed.`);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      toast.error('Delete Failed', err.response?.data?.message || 'Could not delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedTaskIds.length === 0 || !bulkAssignee) return;
    try {
      await API.post('/tasks/bulk-assign', { taskIds: selectedTaskIds, assignedTo: bulkAssignee });
      toast.success('Bulk Assignment Completed', `Successfully reassigned ${selectedTaskIds.length} tasks.`);
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (err) {
      toast.error('Bulk Assignment Failed', err.response?.data?.message || 'Could not reassign tasks');
    }
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((t) => t !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const getPriorityBadge = (p) => {
    if (p === 'Urgent') return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    if (p === 'High') return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (p === 'Medium') return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.assignedTo?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Productivity Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track action items, follow-ups, and sales team assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-smooth cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </button>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 uppercase text-[10px]">Status:</span>
          {['All', 'Todo', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
          <span className="font-semibold text-slate-400 uppercase text-[10px]">Priority:</span>
          {['All', 'Urgent', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                priorityFilter === pr
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>

        {/* Bulk Action Toolbar */}
        {selectedTaskIds.length > 0 && (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-xl border border-blue-200 dark:border-blue-800 animate-fade-in">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300">{selectedTaskIds.length} selected</span>
            <select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Reassign to...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No tasks found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are no tasks matching your filters or search query. Create a new task or adjust your filters.
            </p>
            <button
              onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setSearchQuery(''); }}
              className="mt-4 inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-smooth flex items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task._id)}
                  onChange={() => toggleSelectTask(task._id)}
                  className="mt-1 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 cursor-pointer"
                />
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-smooth shrink-0 cursor-pointer ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-500/30'
                      : task.status === 'In Progress'
                      ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-400'
                  }`}
                  title="Click to toggle status (Todo -> In Progress -> Completed)"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${getPriorityBadge(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </span>
                    <span className="flex items-center font-medium text-slate-600 dark:text-slate-300">
                      <User className="w-3 h-3 mr-1" />
                      {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-smooth cursor-pointer ${
                    task.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : task.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {task.status}
                </button>
                <button
                  onClick={() => confirmDeleteTask(task)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Create New Task</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Follow up on proposal SLA"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  placeholder="Details or specific action steps..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select team member...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This task will be permanently removed.`}
        confirmText="Delete Task"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Tasks;
