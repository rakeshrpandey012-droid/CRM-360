import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  GitPullRequest, Search, Plus, UserCheck, CheckCircle2,
  Building2, Eye, Trash2, ArrowRight, ArrowLeft, DollarSign,
  Briefcase, TrendingUp, Sparkles, Filter, X, Phone, Mail, Award, AlertCircle
} from 'lucide-react';
import CircularChart from '../components/CircularChart';

const PIPELINE_STAGES = [
  { id: 'New', label: 'New Lead', color: 'border-sky-500', headerBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300', badge: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' },
  { id: 'Contacted', label: 'Contacted', color: 'border-blue-500', headerBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
  { id: 'Qualified', label: 'Qualified', color: 'border-indigo-500', headerBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'border-amber-500', headerBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
  { id: 'Won', label: 'Closed Won', color: 'border-emerald-500', headerBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
  { id: 'Lost', label: 'Closed Lost', color: 'border-rose-500', headerBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' },
];

const Pipeline = () => {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('All');
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState('Note');

  // Convert Modal State
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    company: '',
    status: 'New',
    value: '',
    source: 'Website',
    assignedTo: '',
    notes: ''
  });

  const fetchLeadsAndUsers = async () => {
    try {
      setLoading(true);
      const [leadsRes, usersRes] = await Promise.all([
        API.get('/leads', { params: { search } }),
        API.get('/users')
      ]);
      setLeads(leadsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load pipeline leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchLeadsAndUsers, 250);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleUpdateStage = async (leadId, newStage) => {
    try {
      const res = await API.put(`/leads/${leadId}/status`, { status: newStage });
      setLeads(prev => prev.map(l => (l._id === leadId ? res.data.data : l)));
      toast.success('Stage Updated', `Moved to ${newStage}.`);
    } catch (err) {
      toast.error('Move Failed', err.response?.data?.message || 'Could not update pipeline stage');
    }
  };

  const confirmConvertLead = (lead) => {
    setLeadToConvert(lead);
    setConvertModalOpen(true);
  };

  const handleConvertLead = async () => {
    if (!leadToConvert) return;
    try {
      setIsConverting(true);
      const res = await API.post(`/leads/${leadToConvert._id}/convert`);
      toast.success('Converted Successfully!', `Lead "${res.data.data.customer.name}" is now an official Customer.`);
      setConvertModalOpen(false);
      setLeadToConvert(null);
      fetchLeadsAndUsers();
    } catch (err) {
      toast.error('Conversion Failed', err.response?.data?.message || 'Failed to convert lead');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leads', formData);
      setShowAddModal(false);
      setFormData({
        title: '', contactName: '', contactEmail: '', contactPhone: '',
        company: '', status: 'New', value: '', source: 'Website',
        assignedTo: '', notes: ''
      });
      toast.success('Lead Created', 'New opportunity added to Kanban board.');
      fetchLeadsAndUsers();
    } catch (err) {
      toast.error('Create Lead Failed', err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleOpenDetail = async (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
    try {
      const res = await API.get(`/leads/${lead._id}`);
      setActivities(res.data.data.activities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await API.post(`/leads/${selectedLead._id}/activities`, {
        type: activityType,
        description: newNote
      });
      setActivities([res.data.data, ...activities]);
      setNewNote('');
      toast.success('Note Added', `${activityType} recorded.`);
    } catch (err) {
      toast.error('Failed', 'Could not add note');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (selectedUser !== 'All' && lead.assignedTo?._id !== selectedUser && lead.assignedTo !== selectedUser) {
      return false;
    }
    return true;
  });

  const activeLeads = filteredLeads.filter(l => !['Won', 'Lost'].includes(l.status));
  const activeValue = activeLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const wonLeads = filteredLeads.filter(l => l.status === 'Won');
  const wonValue = wonLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const winRate = (wonLeads.length + filteredLeads.filter(l => l.status === 'Lost').length) > 0
    ? Math.round((wonLeads.length / (wonLeads.length + filteredLeads.filter(l => l.status === 'Lost').length)) * 100)
    : 0;

  const stageOrder = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  const getNextStage = (curr) => {
    const idx = stageOrder.indexOf(curr);
    return (idx >= 0 && idx < stageOrder.length - 2) ? stageOrder[idx + 1] : null;
  };

  const getPrevStage = (curr) => {
    const idx = stageOrder.indexOf(curr);
    return idx > 0 && idx < stageOrder.length - 1 ? stageOrder[idx - 1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Interactive Board
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">• Real-time Stage Progression</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track deals across 6 stages from lead qualification through closed won revenue
          </p>
        </div>

        {/* Global Pipeline Quick Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Active Pipeline</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">${activeValue.toLocaleString()}</p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Closed Won</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">${wonValue.toLocaleString()}</p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Win Rate</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{winRate}%</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Deal
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deals by title, company, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sales Rep:</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Representatives</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 6-Column Interactive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.status === stage.id);
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{stage.label}</h2>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stage.badge}`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[620px] pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 dark:text-slate-600">
                    No deals in {stage.label}
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const nextStage = getNextStage(lead.status);
                    const prevStage = getPrevStage(lead.status);

                    return (
                      <div
                        key={lead._id}
                        className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition group relative"
                      >
                        {/* Title & Amount */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3
                            onClick={() => handleOpenDetail(lead)}
                            className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 cursor-pointer line-clamp-2 transition"
                          >
                            {lead.title}
                          </h3>
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md shrink-0">
                            ${Number(lead.value || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Company & Contact */}
                        <div className="space-y-1 mb-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.company && (
                            <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium truncate">
                              <Building2 className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-slate-400">Contact:</span> {lead.contactName}
                          </div>
                        </div>

                        {/* Tags & Assignee */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium">
                            {lead.source || 'Website'}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[90px]">
                            {lead.assignedTo?.name ? lead.assignedTo.name.split(' ')[0] : 'Unassigned'}
                          </span>
                        </div>

                        {/* Quick Action Progression Controls */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                          {prevStage && (
                            <button
                              onClick={() => handleUpdateStage(lead._id, prevStage)}
                              title={`Move back to ${prevStage}`}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 text-[10px] flex items-center"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {['Qualified', 'Proposal Sent', 'Won'].includes(lead.status) && (
                            <button
                              onClick={() => confirmConvertLead(lead)}
                              title="Convert to Customer"
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center cursor-pointer transition"
                            >
                              <UserCheck className="w-3 h-3 mr-1" /> Convert
                            </button>
                          )}

                          {nextStage && (
                            <button
                              onClick={() => handleUpdateStage(lead._id, nextStage)}
                              title={`Advance to ${nextStage}`}
                              className="p-1 ml-auto rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] flex items-center"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {!['Won', 'Lost'].includes(lead.status) && (
                            <div className="flex items-center space-x-1 ml-auto">
                              <button
                                onClick={() => handleUpdateStage(lead._id, 'Won')}
                                title="Mark as Won"
                                className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-[10px] font-bold"
                              >
                                ✓ Won
                              </button>
                              <button
                                onClick={() => handleUpdateStage(lead._id, 'Lost')}
                                title="Mark as Lost"
                                className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-200 text-[10px] font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Add Pipeline Deal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Deal / Lead Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Enterprise Cloud Migration Contract"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Contact Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="jane@acme.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Initial Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Assign Sales Rep</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Assign to Me / Default</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
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
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Activity History Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold">{selectedLead.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedLead.company || 'Direct Contact'}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-semibold text-[10px]">Current Stage</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedLead.status}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-semibold text-[10px]">Deal Value</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${Number(selectedLead.value || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-semibold text-[10px]">Contact</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLead.contactName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-semibold text-[10px]">Assigned Rep</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLead.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>

            {/* Interaction History & Timeline */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Interaction History & Notes
              </h4>

              <form onSubmit={handleAddNote} className="mb-4">
                <div className="flex gap-2 mb-2">
                  {['Note', 'Call', 'Meeting', 'Email'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActivityType(t)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        activityType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Log a ${activityType.toLowerCase()} or follow-up note...`}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Log
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No interactions logged yet</p>
                ) : (
                  activities.map((act) => (
                    <div key={act._id} className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{act.type}</span>
                        <span>{new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{act.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Convert Opportunity Modal */}
      <ConfirmModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        onConfirm={handleConvertLead}
        title="Convert Deal to Customer Account"
        message={`Convert "${leadToConvert?.title}" (${leadToConvert?.company || leadToConvert?.contactName}) into a permanent customer record? This will mark the opportunity as Closed Won and set up customer history.`}
        confirmText="Convert Account"
        confirmVariant="primary"
        isLoading={isConverting}
      />
    </div>
  );
};

export default Pipeline;
