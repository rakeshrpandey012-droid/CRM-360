import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  Users, Search, Plus, Edit2, Trash2, Eye, Building2, Mail, Phone, Calendar, X,
  Send, CheckCircle2, MessageSquare, Clock, TrendingUp, Layers, List, DollarSign,
  RefreshCw, Zap, Link2
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const STAGES = [
  { id: 'New',            chart: '#3b82f6', bar: 'bg-blue-500',      badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' },
  { id: 'Contacted',      chart: '#6366f1', bar: 'bg-indigo-500',    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' },
  { id: 'Qualified',      chart: '#8b5cf6', bar: 'bg-violet-500',    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800' },
  { id: 'Proposal Sent',  chart: '#0ea5e9', bar: 'bg-sky-500',       badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800' },
  { id: 'Won',            chart: '#10b981', bar: 'bg-emerald-500',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  { id: 'Lost',           chart: '#f43f5e', bar: 'bg-rose-500',      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' }
];

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];

const SOURCE_COLORS = {
  Website: 'bg-blue-500',
  Referral: 'bg-emerald-500',
  LinkedIn: 'bg-sky-500',
  'Cold Call': 'bg-amber-500',
  Event: 'bg-violet-500',
  Other: 'bg-slate-500'
};

const ACTIVITY_TYPES = ['Note', 'Call', 'Meeting', 'Email'];

const EMPTY_FORM = {
  title: '', contactName: '', contactEmail: '', contactPhone: '', company: '',
  status: 'New', value: '', source: 'Website', assignedTo: '', notes: ''
};

const getStage = (id) => STAGES.find((s) => s.id === id) || STAGES[0];

const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const initials = (name) =>
  name ? name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() : '?';

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('crm360_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Zero-dependency donut ring (SVG)                                   */
/* ------------------------------------------------------------------ */

const DonutRing = ({ segments = [], size = 150, stroke = 16, children }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  let consumed = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="text-slate-200 dark:text-slate-700"
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circumference;
          const offset = consumed;
          consumed += len;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

const Leads = () => {
  const toast = useToast();
  const currentUser = getCurrentUser();

  /* Data state */
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' | 'card'

  /* Filters */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');

  /* Modals */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailActivities, setDetailActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [activityType, setActivityType] = useState('Note');

  /* Destructive / conversion modals */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  /* Form state */
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  /* ---------------------------- data loading ---------------------------- */

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (assignedFilter !== 'All') params.assignedTo = assignedFilter;
      const res = await API.get('/leads', { params });
      setLeads(res.data.data);
    } catch (err) {
      console.error('Failed to load leads', err);
      toast.error('Load Failed', 'Could not load leads from the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load team members', err);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter, assignedFilter]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => fetchLeads();

  /* ---------------------------- derived stats ---------------------------- */

  const totalLeads = leads.length;
  const openLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const convertedLeads = leads.filter((l) => l.isConverted).length;
  const pipelineValue = leads
    .filter((l) => l.status !== 'Lost')
    .reduce((sum, l) => sum + (l.value || 0), 0);
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const stageStats = STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.status === s.id).length,
    value: leads.filter((l) => l.status === s.id).reduce((sum, l) => sum + (l.value || 0), 0)
  }));

  const sourceStats = SOURCES
    .map((src) => ({ source: src, count: leads.filter((l) => l.source === src).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const donutSegments = stageStats.filter((s) => s.count > 0);

  /* --------------------------- CRUD handlers --------------------------- */

  const findUser = (id) => users.find((u) => u._id === id);

  const openAddModal = () => {
    setFormData({ ...EMPTY_FORM, assignedTo: currentUser?._id || '' });
    setShowAddModal(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      title: lead.title,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      contactPhone: lead.contactPhone || '',
      company: lead.company || '',
      status: lead.status,
      value: lead.value ? String(lead.value) : '',
      source: lead.source,
      assignedTo: lead.assignedTo?._id || '',
      notes: lead.notes || ''
    });
    setShowEditModal(true);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value) || 0,
        assignedTo: formData.assignedTo || currentUser?._id
      };
      const res = await API.post('/leads', payload);
      setShowAddModal(false);
      setFormData({ ...EMPTY_FORM });
      toast.success('Lead Created', `Lead "${res.data.data.title}" added to the pipeline.`);
      fetchLeads();
    } catch (err) {
      toast.error('Create Lead Failed', err.response?.data?.message || 'Could not create lead');
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value) || 0,
        assignedTo: formData.assignedTo || null
      };
      await API.put(`/leads/${selectedLead._id}`, payload);
      setShowEditModal(false);
      toast.success('Lead Updated', `Changes to "${formData.title}" saved successfully.`);
      fetchLeads();
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not update lead');
    }
  };

  const handleStatusChange = async (lead, status) => {
    if (!status || status === lead.status) return;
    try {
      await API.put(`/leads/${lead._id}/status`, { status });
      toast.success('Stage Updated', `"${lead.title}" moved to ${status}.`);
      fetchLeads();
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not update stage');
    }
  };

  const handleAssignChange = async (lead, assignedTo) => {
    if (!assignedTo) return;
    if (lead.assignedTo?._id === assignedTo) return;
    try {
      await API.put(`/leads/${lead._id}/assign`, { assignedTo });
      toast.success('Lead Assigned', `"${lead.title}" is now owned by ${findUser(assignedTo)?.name || 'a teammate'}.`);
      fetchLeads();
    } catch (err) {
      toast.error('Assign Failed', err.response?.data?.message || 'Could not reassign lead');
    }
  };

  const openDetail = async (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
    try {
      const res = await API.get(`/leads/${lead._id}`);
      setSelectedLead(res.data.data.lead);
      setDetailActivities(res.data.data.activities || []);
    } catch (err) {
      console.error('Failed to load lead details', err);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;
    try {
      const res = await API.post(`/leads/${selectedLead._id}/activities`, {
        type: activityType,
        description: newActivity.trim()
      });
      setDetailActivities([res.data.data, ...detailActivities]);
      setNewActivity('');
      toast.success('Activity Logged', `${activityType} added to the lead timeline.`);
    } catch (err) {
      toast.error('Log Failed', 'Could not record activity');
    }
  };

  const openConvert = (lead) => {
    setLeadToConvert(lead);
    setShowConvertModal(true);
  };

  const confirmConvert = async () => {
    if (!leadToConvert) return;
    try {
      setIsConverting(true);
      const res = await API.post(`/leads/${leadToConvert._id}/convert`);
      setShowConvertModal(false);
      setLeadToConvert(null);
      toast.success('Lead Converted', `"${res.data.data.lead.title}" is now a customer account.`);
      fetchLeads();
    } catch (err) {
      toast.error('Conversion Failed', err.response?.data?.message || 'Could not convert this lead');
    } finally {
      setIsConverting(false);
    }
  };

  const confirmDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      await API.delete(`/leads/${leadToDelete._id}`);
      setShowDeleteModal(false);
      setLeadToDelete(null);
      toast.success('Lead Removed', `"${leadToDelete.title}" has been deleted from the pipeline.`);
      fetchLeads();
    } catch (err) {
      toast.error('Delete Failed', err.response?.data?.message || 'Could not delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------ render ------------------------------ */

  const renderAssigneeSelect = (lead, compact = false) => (
    <select
      value={lead.assignedTo?._id || ''}
      onChange={(e) => handleAssignChange(lead, e.target.value)}
      className={`${compact ? 'w-28' : 'w-full'} px-2 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer transition`}
      title="Reassign lead owner"
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u._id} value={u._id}>{u.name}</option>
      ))}
    </select>
  );

  const renderStageSelect = (lead) => (
    <select
      value={lead.status}
      onChange={(e) => handleStatusChange(lead, e.target.value)}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${getStage(lead.status).badge}`}
      title="Change pipeline stage"
    >
      {STAGES.map((s) => (
        <option key={s.id} value={s.id}>{s.id}</option>
      ))}
    </select>
  );

  const renderConvertedChip = (lead) =>
    lead.isConverted && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Converted
      </span>
    );

  const renderActions = (lead) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => openDetail(lead)}
        title="View Details & Timeline"
        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => openEditModal(lead)}
        title="Edit Lead"
        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      {!lead.isConverted && lead.status !== 'Lost' && (
        <button
          onClick={() => openConvert(lead)}
          title="Convert to Customer"
          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => confirmDeleteLead(lead)}
        title="Delete Lead"
        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ------------------------------ Page header ------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Lead Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track prospects, qualify deals, and convert pipeline opportunities into customers
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </button>
      </div>

      {/* ------------------------------ KPI stats ------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalLeads}</div>
              <div className="text-[11px] text-slate-400 mt-1">Across all pipeline stages</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Leads</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{openLeads}</div>
              <div className="text-[11px] text-slate-400 mt-1"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{wonLeads} won</span> • in play</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Value</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{formatMoney(pipelineValue)}</div>
              <div className="text-[11px] text-slate-400 mt-1">Excludes lost deals</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{conversionRate}%</div>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{convertedLeads} converted</span> to customers
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Filters ------------------------------ */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, contact, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['All', ...STAGES.map((s) => s.id)].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-2.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            title="Filter by owner"
          >
            <option value="All">All Owners</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" title="Toggle view">
            <button
              onClick={() => setView('table')}
              className={`px-2.5 py-1.5 inline-flex items-center ${
                view === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } transition`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('card')}
              className={`px-2.5 py-1.5 inline-flex items-center ${
                view === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } transition`}
              title="Card view"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={refresh}
            title="Refresh leads"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------ Insight panels ------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <Layers className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" /> Pipeline Distribution
          </h3>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0">
              {totalLeads === 0 ? (
                <p className="text-xs text-slate-400 text-center pt-10">No leads yet</p>
              ) : (
                <DonutRing segments={donutSegments}>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{totalLeads}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Leads</span>
                </DonutRing>
              )}
            </div>
            <div className="flex-1 space-y-2.5">
              {stageStats.map((stage) => {
                const pct = totalLeads ? Math.round((stage.count / totalLeads) * 100) : 0;
                return (
                  <div key={stage.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="w-24 flex items-center text-slate-600 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${stage.bar}`} /> {stage.id}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${stage.bar} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right font-semibold text-slate-700 dark:text-slate-200">{stage.count}</span>
                    <span className="w-20 text-right text-slate-500 dark:text-slate-400 font-mono">{formatMoney(stage.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lead sources */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" /> Lead Generation Sources
          </h3>
          {sourceStats.length === 0 ? (
            <p className="text-xs text-slate-400 italic mt-6">No source data available yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {sourceStats.map(({ source, count }) => {
                const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={source} className="flex items-center justify-between gap-2 text-xs">
                    <span className="w-24 flex items-center text-slate-600 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${SOURCE_COLORS[source]}`} /> {source}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${SOURCE_COLORS[source]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-right font-semibold text-slate-700 dark:text-slate-200">{count}</span>
                    <span className="w-16 text-right text-slate-500 dark:text-slate-400">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-2 text-amber-500 shrink-0" />
            Tip: High-value leads often come from referrals — prioritize warm sources.
          </div>
        </div>
      </div>

      {/* ------------------------------ Leads table ------------------------------ */}
      {view === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Lead / Contact</th>
                  <th className="px-6 py-3.5">Company &amp; Source</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Deal Value</th>
                  <th className="px-6 py-3.5">Assigned To</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No leads found matching your filters.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{lead.title}</div>
                        <div className="text-xs text-slate-400 flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1" /> {lead.contactName} • {lead.contactEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                          {lead.company || 'N/A'}
                        </div>
                        <span className="text-xs text-slate-400 inline-flex items-center mt-0.5">
                          <span className={`w-2 h-2 rounded-full mr-1 ${SOURCE_COLORS[lead.source] || 'bg-slate-400'}`} />
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">{renderStageSelect(lead)}{renderConvertedChip(lead)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{formatMoney(lead.value)}</td>
                      <td className="px-6 py-4">{renderAssigneeSelect(lead, true)}</td>
                      <td className="px-6 py-4 text-right">{renderActions(lead)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ------------------------- Leads card grid ------------------------- */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm py-12 text-center text-slate-400">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm py-12 text-center text-slate-400">
              No leads found matching your filters.
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-4">
                <div className="flex items-center justify-between">
                  {renderConvertedChip(lead) || <span className="text-[10px] text-slate-400">#{lead._id.slice(-6).toUpperCase()}</span>}
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">{formatMoney(lead.value)}</span>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-slate-900 dark:text-white">{lead.title}</div>
                  <div className="text-xs text-slate-400 flex items-center mt-0.5">
                    <Mail className="w-3 h-3 mr-1" /> {lead.contactName} • {lead.contactEmail}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center mt-1">
                    <Building2 className="w-3 h-3 mr-1" /> {lead.company || 'N/A'}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {renderStageSelect(lead)}
                  <span className="text-xs text-slate-400 inline-flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${SOURCE_COLORS[lead.source] || 'bg-slate-400'}`} />
                    {lead.source}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {renderAssigneeSelect(lead, true)}
                  {renderActions(lead)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------------ ADD LEAD MODAL ------------------------------ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 animate-modal-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Title *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Enterprise SaaS License" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Acme Corp" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Name *</label>
                  <input required type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Sarah Connor" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email *</label>
                  <input required type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="sarah@acme.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input type="text" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="+1 555-0100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deal Value ($)</label>
                  <input type="number" min="0" step="any" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="25000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source</label>
                  <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
                <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name} — {u.role}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Background, pain points, next steps..." />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------ EDIT LEAD MODAL ------------------------------ */}
      {showEditModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 animate-modal-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Lead</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateLead} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Title *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Name *</label>
                  <input required type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email *</label>
                  <input required type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input type="text" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deal Value ($)</label>
                  <input type="number" min="0" step="any" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source</label>
                  <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
                <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none">
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name} — {u.role}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-blue-500 focus:outline-none resize-none" />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition">
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------ LEAD DETAIL MODAL ------------------------------ */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-modal-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedLead.title}</h2>
                  {renderConvertedChip(selectedLead)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedLead.company || 'No Company'} • {selectedLead.contactName}
                </p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Info card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Deal Value</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatMoney(selectedLead.value)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Stage</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStage(selectedLead.status).badge}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 break-all">{selectedLead.contactEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLead.contactPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Created</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {new Date(selectedLead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 flex items-center"><Users className="w-3 h-3 mr-1" /> Assigned To</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLead.assignedTo?.name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer Account</span>
                  {selectedLead.isConverted && selectedLead.customerId ? (
                    <span className="inline-flex items-center font-semibold text-emerald-700 dark:text-emerald-300">
                      <Link2 className="w-3 h-3 mr-1" /> {selectedLead.customerId.name || 'Linked'}
                    </span>
                  ) : (
                    <span className="text-slate-400">Not converted</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">Lead Notes</span>
                  <p className="text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">{selectedLead.notes}</p>
                </div>
              )}

              {/* Add support note */}
              <div className="p-4 border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/30 rounded-xl">
                <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Log Lead Activity
                </h3>
                <form onSubmit={handleAddActivity} className="space-y-3">
                  <div className="flex space-x-2">
                    {ACTIVITY_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActivityType(t)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          activityType === t
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Follow-up notes, call summary, or meeting details..."
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center transition shadow-xs">
                      <Send className="w-3.5 h-3.5 mr-1" /> Log
                    </button>
                  </div>
                </form>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Activity Timeline
                </h3>
                {detailActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activities logged for this lead yet.</p>
                ) : (
                  <div className="space-y-3">
                    {detailActivities.map((act) => (
                      <div key={act._id} className="p-3 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-xl shadow-xs flex items-start space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          act.type === 'Call' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
                          : act.type === 'Meeting' ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300'
                          : act.type === 'Email' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                        }`}>
                          {act.type.charAt(0)}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-100">{act.type}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{act.description}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Logged by: {act.createdBy?.name || 'User'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ Convert confirmation ------------------------------ */}
      <ConfirmModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConfirm={confirmConvert}
        title="Convert Lead to Customer"
        message={`Convert "${leadToConvert?.title}" into a customer account? The deal stage will be set to Won and a customer record will be created automatically.`}
        confirmText="Convert & Create Customer"
        confirmVariant="primary"
        isLoading={isConverting}
      />

      {/* ------------------------------ Delete confirmation ------------------------------ */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete "${leadToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Lead"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Leads;