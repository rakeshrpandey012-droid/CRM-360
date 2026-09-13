import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  GitPullRequest, Search, Plus, UserCheck, CheckCircle2,
  Building2, Eye, Trash2, MessageSquare, Layers, List, X, Send, Clock
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'New', label: 'New Lead' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Qualified', label: 'Qualified' },
  { id: 'Proposal Sent', label: 'Proposal Sent' },
  { id: 'Won', label: 'Closed Won' },
  { id: 'Lost', label: 'Closed Lost' },
];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [pipelineMetrics, setPipelineMetrics] = useState({
    winRate: 0, conversionRate: 0, activePipelineValue: 0, totalLeads: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState('Note');

  const [formData, setFormData] = useState({
    title: '', contactName: '', contactEmail: '', contactPhone: '',
    company: '', status: 'New', value: '', source: 'Website',
    assignedTo: '', notes: ''
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const [leadsRes, pipeRes, usersRes] = await Promise.all([
        API.get('/leads', { params: { search } }),
        API.get('/dashboard/pipeline'),
        API.get('/users')
      ]);
      setLeads(leadsRes.data.data || []);
      setPipelineMetrics(pipeRes.data.data || {});
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchLeads, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const res = await API.put(`/leads/${leadId}/status`, { status: newStatus });
      setLeads(leads.map((l) => (l._id === leadId ? res.data.data : l)));
      const pipeRes = await API.get('/dashboard/pipeline');
      setPipelineMetrics(pipeRes.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const handleConvertLead = async (leadId) => {
    if (!window.confirm('Convert this lead into a permanent Customer account? This will mark the deal as Closed Won.')) return;
    try {
      const res = await API.post(`/leads/${leadId}/convert`);
      alert(`Success! Lead converted to customer "${res.data.data.customer.name}".`);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert lead');
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
        type: activityType, description: newNote
      });
      setActivities([res.data.data, ...activities]);
      setNewNote('');
    } catch (err) {
      alert('Failed to log note');
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
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Delete this lead?')) {
      try {
        await API.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline & Leads</h1>
          <p className="text-sm text-slate-500">Track and advance opportunities through the 6-stage sales funnel</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1.5" /> Table View
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center sm:text-left border-r border-slate-100 last:border-none px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            ${(pipelineMetrics.activePipelineValue || 0).toLocaleString()}
          </span>
        </div>
        <div className="text-center sm:text-left border-r border-slate-100 last:border-none px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Win Rate</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{pipelineMetrics.winRate || 0}%</span>
        </div>
        <div className="text-center sm:text-left border-r border-slate-100 last:border-none px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">{pipelineMetrics.conversionRate || 0}%</span>
        </div>
        <div className="text-center sm:text-left px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Deals</span>
          <span className="text-xl font-bold text-slate-800 mt-1 block">{leads.length} Leads</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search deals by title, contact, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xs"
        />
      </div>

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.id);
            const stageTotal = stageLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);
            return (
              <div key={stage.id} className="flex flex-col bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 min-w-[240px] max-h-[78vh]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage.label}</h3>
                    <span className="text-[11px] font-medium text-slate-500">${stageTotal.toLocaleString()}</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-full border border-slate-200 shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">No deals in this stage</div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div key={lead._id} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{lead.source}</span>
                          <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            ${(lead.value || 0).toLocaleString()}
                          </span>
                        </div>
                        <h4 onClick={() => handleOpenDetail(lead)} className="font-bold text-sm text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-2">
                          {lead.title}
                        </h4>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div className="font-medium text-slate-700 truncate flex items-center">
                            <Building2 className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                            {lead.company || lead.contactName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{lead.contactEmail}</div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                            className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                          <div className="flex items-center space-x-1">
                            {!lead.isConverted && (
                              <button
                                onClick={() => handleConvertLead(lead._id)}
                                title="1-Click Convert to Customer"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenDetail(lead)}
                              title="View Activities"
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {lead.isConverted && (
                          <div className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Converted Account
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Deal Opportunity</th>
                  <th className="px-6 py-3.5">Company & Contact</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Value</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600" onClick={() => handleOpenDetail(lead)}>
                        {lead.title}
                      </div>
                      <div className="text-xs text-slate-400">{lead.source}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{lead.company || '—'}</div>
                      <div className="text-xs text-slate-500">{lead.contactName} ({lead.contactEmail})</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">${(lead.value || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{lead.assignedTo?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {!lead.isConverted && (
                        <button
                          onClick={() => handleConvertLead(lead._id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                        >
                          Convert
                        </button>
                      )}
                      <button onClick={() => handleOpenDetail(lead)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteLead(lead._id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Create New Sales Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  placeholder="e.g. Enterprise Migration"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    placeholder="25000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedLead.title}</h2>
                <p className="text-xs text-slate-500">{selectedLead.company || selectedLead.contactName} • ${(selectedLead.value || 0).toLocaleString()} • Stage: {selectedLead.status}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {!selectedLead.isConverted ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">Ready to close this deal? Convert to a Customer record.</span>
                  <button
                    onClick={() => {
                      handleConvertLead(selectedLead._id);
                      setShowDetailModal(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                  >
                    Convert to Customer
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> This deal was converted into a Customer account.
                </div>
              )}

              <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Log Lead Interaction Note
                </h3>
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="flex space-x-2">
                    {['Note', 'Call', 'Meeting', 'Email'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActivityType(t)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg ${
                          activityType === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add follow-up notes, discussion summary..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                    <button type="submit" className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center">
                      <Send className="w-3.5 h-3.5 mr-1" /> Log
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timeline</h3>
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div key={act._id} className="p-3 bg-white border border-slate-100 rounded-xl text-xs flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {act.type.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{act.type}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
