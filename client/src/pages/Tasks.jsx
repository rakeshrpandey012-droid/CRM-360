import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  CheckSquare, Plus, Search, CheckCircle2, Clock, AlertCircle,
  Trash2, User, Calendar, X, Users, ArrowRight
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
      console.error(err);
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
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', formData);
      setShowAddModal(false);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await API.delete(`/tasks/${id}`);
        setTasks(tasks.filter((t) => t._id !== id));
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleBulkAssign = async () => {
    if (selectedTaskIds.length === 0 || !bulkAssignee) return;
    try {
      await API.post('/tasks/bulk-assign', { taskIds: selectedTaskIds, assignedTo: bulkAssignee });
      alert(`Successfully reassigned ${selectedTaskIds.length} tasks`);
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (err) {
      alert('Failed to bulk assign');
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
    if (p === 'Urgent') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'High') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p === 'Medium') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500">Track action items, follow-ups, and sales team assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </button>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 uppercase">Status:</span>
          {['All', 'Todo', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <span className="font-semibold text-slate-400 uppercase">Priority:</span>
          {['All', 'Urgent', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                priorityFilter === pr ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>

        {/* Bulk Action Toolbar */}
        {selectedTaskIds.length > 0 && (
          <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-xl border border-blue-200">
            <span className="text-xs font-bold text-blue-900">{selectedTaskIds.length} selected</span>
            <select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              className="text-xs bg-white border border-blue-300 rounded-lg px-2 py-1 text-slate-700"
            >
              <option value="">Reassign to...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No tasks matching the selected filters.</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task._id)}
                  onChange={() => toggleSelectTask(task._id)}
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : task.status === 'In Progress'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-slate-300 text-transparent'
                  }`}
                  title="Click to cycle status"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${getPriorityBadge(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </span>
                    <span className="flex items-center font-medium text-slate-600">
                      <User className="w-3 h-3 mr-1" />
                      {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  {task.status}
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Create New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Follow up on proposal SLA"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="Details or action steps..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select team member...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
