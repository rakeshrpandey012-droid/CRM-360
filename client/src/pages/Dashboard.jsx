import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import {
  Users, GitPullRequest, CheckSquare, DollarSign, TrendingUp,
  AlertCircle, Award, CheckCircle2,
  Target, Activity, Briefcase, CalendarCheck, ListTodo, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const STAGE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
const PRIORITY_COLORS = { Low: '#10b981', Medium: '#3b82f6', High: '#f59e0b', Urgent: '#ef4444' };

/* ─── Shared components ─────────────────────────── */

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, badge, badgeColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-4 flex items-baseline justify-between">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {badge && (
        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
  </div>
);

const SectionHeader = ({ title, sub }) => (
  <div>
    <h2 className="text-base font-bold text-slate-800">{title}</h2>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">Loading your dashboard...</p>
    </div>
  </div>
);

/* ─── ADMIN DASHBOARD ───────────────────────────── */
const AdminDashboard = ({ stats, pipeline, revenueData, teamData, sourceData }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Admin Control Center</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-sm text-slate-500">Full organisational visibility across all teams and pipelines</p>
      </div>
      <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <div className="flex items-center text-slate-700">
          <span className="text-slate-400 mr-1.5">Win Rate:</span>
          <span className="text-emerald-600 font-bold">{pipeline.winRate}%</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center text-slate-700">
          <span className="text-slate-400 mr-1.5">Conversion:</span>
          <span className="text-blue-600 font-bold">{pipeline.conversionRate}%</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center text-slate-700">
          <span className="text-slate-400 mr-1.5">Pipeline:</span>
          <span className="text-indigo-600 font-bold">${pipeline.activePipelineValue.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard label="Total Customers" value={stats.totalCustomers} sub="Active enterprise accounts" icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" badge={<><TrendingUp className="w-3 h-3 mr-1 inline" />{stats.customersTrend}</>} badgeColor="text-emerald-600 bg-emerald-50" />
      <StatCard label="Active Leads" value={stats.activeLeads} sub="In active qualification pipeline" icon={GitPullRequest} iconBg="bg-indigo-50" iconColor="text-indigo-600" badge={<><TrendingUp className="w-3 h-3 mr-1 inline" />{stats.leadsTrend}</>} badgeColor="text-blue-600 bg-blue-50" />
      <StatCard label="Pending Tasks" value={stats.pendingTasks} sub="Tasks requiring completion" icon={CheckSquare} iconBg="bg-amber-50" iconColor="text-amber-600" badge={stats.urgentTasks > 0 ? <><AlertCircle className="w-3 h-3 mr-1 inline" />{stats.urgentTasks} urgent</> : null} badgeColor="text-rose-600 bg-rose-50" />
      <StatCard label="Won Deals & Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub="Total won revenue generated" icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" badge={`${stats.closedDeals} closed`} badgeColor="text-emerald-700 bg-emerald-100" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Monthly Revenue Overview" sub="Actual Revenue vs Target Quota" />
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Last 6 Months</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <SectionHeader title="Pipeline Stages" sub="Distribution of leads across sales stages" />
        <div className="h-56 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pipeline.stages} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {pipeline.stages.map((_, index) => <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} leads`, name]} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
          {pipeline.stages.map((s, idx) => (
            <div key={s.stage} className="flex items-center space-x-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }} />
              <span className="truncate">{s.stage}: <strong className="text-slate-900">{s.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4"><SectionHeader title="Lead Generation Channels" sub="Lead acquisitions categorised by origin" /></div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} leads`, 'Count']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Team Conversion Performance" sub="Sales metrics per team member" />
          <Award className="w-5 h-5 text-amber-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="pb-3">Rep Name</th>
                <th className="pb-3 text-center">Assigned</th>
                <th className="pb-3 text-center">Won</th>
                <th className="pb-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamData.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50 transition">
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-600">{member.assignedLeads}</td>
                  <td className="py-3 text-center text-emerald-600 font-semibold">{member.closedWon}</td>
                  <td className="py-3 text-right text-slate-900 font-bold">${member.revenueGenerated.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">{member.conversionRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

/* ─── SALES MANAGER DASHBOARD ─────────────────── */
const ManagerDashboard = ({ stats, pipeline, revenueData, teamData, urgentTaskList }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Sales Manager View</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline & Team Command</h1>
        <p className="text-sm text-slate-500">Monitor your team's pipeline health and conversion progress</p>
      </div>
      <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <div className="flex items-center text-slate-700">
          <span className="text-slate-400 mr-1.5">Win Rate:</span>
          <span className="text-emerald-600 font-bold">{pipeline.winRate}%</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center text-slate-700">
          <span className="text-slate-400 mr-1.5">Pipeline Value:</span>
          <span className="text-blue-600 font-bold">${pipeline.activePipelineValue.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <StatCard label="Active Leads" value={stats.activeLeads} sub="Leads in qualification stages" icon={GitPullRequest} iconBg="bg-indigo-50" iconColor="text-indigo-600" badge={<><TrendingUp className="w-3 h-3 mr-1 inline" />{stats.leadsTrend}</>} badgeColor="text-blue-600 bg-blue-50" />
      <StatCard label="Revenue Closed" value={`$${stats.totalRevenue.toLocaleString()}`} sub={`${stats.closedDeals} deals closed`} icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" badge={`${stats.closedDeals} won`} badgeColor="text-emerald-700 bg-emerald-100" />
      <StatCard label="Pending Tasks" value={stats.pendingTasks} sub="Team tasks needing action" icon={CheckSquare} iconBg="bg-amber-50" iconColor="text-amber-600" badge={stats.urgentTasks > 0 ? <><AlertCircle className="w-3 h-3 mr-1 inline" />{stats.urgentTasks} urgent</> : null} badgeColor="text-rose-600 bg-rose-50" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <SectionHeader title="Pipeline Stage Breakdown" sub="Leads distributed by stage" />
        <div className="h-56 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pipeline.stages} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {pipeline.stages.map((_, index) => <Cell key={index} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} leads`, n]} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {pipeline.stages.map((s, idx) => (
            <div key={s.stage} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }} />
                <span className="text-slate-600">{s.stage}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{s.count}</span>
                <span className="text-slate-400 text-[10px]">${s.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Revenue vs Target" sub="Actual monthly performance against quota" />
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Last 6 Months</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mgrRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#mgrRev)" />
              <Area type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Team Leaderboard" sub="Rep performance ranked by revenue" />
          <Award className="w-5 h-5 text-amber-500" />
        </div>
        <div className="space-y-3">
          {[...teamData].sort((a, b) => b.revenueGenerated - a.revenueGenerated).map((member, idx) => (
            <div key={member._id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-400'}`}>
                {idx + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                <p className="text-xs text-slate-400">{member.assignedLeads} leads · {member.conversionRate} conv.</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600">${member.revenueGenerated.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">{member.closedWon} won</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Urgent Pending Tasks" sub="High-priority items needing attention" />
          <AlertCircle className="w-5 h-5 text-rose-500" />
        </div>
        {urgentTaskList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-400" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs">No pending tasks right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentTaskList.map((task) => (
              <div key={task._id} className="flex items-start space-x-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <div className="mt-0.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full block mt-1.5" style={{ backgroundColor: PRIORITY_COLORS[task.priority] || '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {task.assignedTo?.name || 'Unassigned'} · Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] + '20', color: PRIORITY_COLORS[task.priority] }}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ─── SALES EXECUTIVE DASHBOARD ───────────────── */
const ExecutiveDashboard = ({ myLeads, myTasks, sourceData }) => {
  const myLeadsByStage = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map(stage => ({
    stage,
    count: myLeads.filter(l => l.status === stage).length,
    value: myLeads.filter(l => l.status === stage).reduce((s, l) => s + (l.value || 0), 0)
  }));

  const dueSoon = [...myTasks]
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const completedToday = myTasks.filter(t => t.status === 'Completed').length;
  const activeLeads = myLeads.filter(l => !['Won', 'Lost'].includes(l.status)).length;
  const myRevenue = myLeads.filter(l => l.status === 'Won').reduce((s, l) => s + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Sales Executive View</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Sales Dashboard</h1>
          <p className="text-sm text-slate-500">Your personal leads, tasks, and daily priorities</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          <div className="flex items-center text-slate-700">
            <span className="text-slate-400 mr-1.5">My Leads:</span>
            <span className="text-indigo-600 font-bold">{myLeads.length}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center text-slate-700">
            <span className="text-slate-400 mr-1.5">Active Pipeline:</span>
            <span className="text-emerald-600 font-bold">{activeLeads}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center text-slate-700">
            <span className="text-slate-400 mr-1.5">Tasks Done:</span>
            <span className="text-blue-600 font-bold">{completedToday}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard label="My Active Leads" value={activeLeads} sub="Leads in your pipeline" icon={GitPullRequest} iconBg="bg-indigo-50" iconColor="text-indigo-600" badge={`${myLeads.length} total`} badgeColor="text-indigo-600 bg-indigo-50" />
        <StatCard label="My Revenue Won" value={`$${myRevenue.toLocaleString()}`} sub="Your closed deals value" icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" badge={`${myLeads.filter(l => l.status === 'Won').length} won`} badgeColor="text-emerald-700 bg-emerald-100" />
        <StatCard label="My Open Tasks" value={myTasks.filter(t => t.status !== 'Completed').length} sub="Tasks assigned to you" icon={ListTodo} iconBg="bg-amber-50" iconColor="text-amber-600" badge={myTasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length > 0 ? <><AlertCircle className="w-3 h-3 mr-1 inline" />{myTasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length} urgent</> : null} badgeColor="text-rose-600 bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <SectionHeader title="My Pipeline Breakdown" sub="Your leads by stage and deal value" />
          </div>
          <div className="space-y-2.5">
            {myLeadsByStage.filter(s => s.count > 0 || true).map((s, idx) => (
              <div key={s.stage} className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{s.stage}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: myLeads.length > 0 ? `${Math.max((s.count / myLeads.length) * 100, s.count > 0 ? 8 : 0)}%` : '0%',
                      backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length]
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-800 w-4">{s.count}</span>
                  {s.value > 0 && <span className="text-[10px] text-slate-400">${s.value.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>

          {myLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 mt-4">
              <GitPullRequest className="w-8 h-8 mb-2 text-indigo-300" />
              <p className="text-sm font-medium">No leads assigned yet</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="My Upcoming Tasks" sub="Sorted by nearest due date" />
            <CalendarCheck className="w-5 h-5 text-blue-500" />
          </div>
          {dueSoon.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-400" />
              <p className="text-sm font-medium">All clear!</p>
              <p className="text-xs">No pending tasks</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dueSoon.map((task) => {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;
                const isDueSoon = diffDays <= 2 && diffDays >= 0;
                return (
                  <div key={task._id} className={`flex items-start space-x-3 p-3 rounded-xl border transition ${isOverdue ? 'border-rose-200 bg-rose-50/30' : isDueSoon ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="mt-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: PRIORITY_COLORS[task.priority] || '#94a3b8' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                      <p className={`text-xs mt-0.5 font-medium ${isOverdue ? 'text-rose-500' : isDueSoon ? 'text-amber-600' : 'text-slate-400'}`}>
                        {isOverdue ? `Overdue by ${Math.abs(diffDays)} day(s)` : diffDays === 0 ? 'Due today!' : `Due in ${diffDays} day(s)`}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] + '20', color: PRIORITY_COLORS[task.priority] }}>
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4"><SectionHeader title="Lead Source Channels" sub="Where your leads are coming from" /></div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} leads`, 'Count']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="My Recent Leads" sub="Latest leads in your pipeline" />
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          {myLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <GitPullRequest className="w-8 h-8 mb-2 text-indigo-300" />
              <p className="text-sm font-medium">No leads assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...myLeads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((lead) => (
                <div key={lead._id} className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {lead.contactName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{lead.contactName}</p>
                    <p className="text-xs text-slate-400 truncate">{lead.company || lead.contactEmail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[['New','Contacted','Qualified','Proposal Sent','Won','Lost'].indexOf(lead.status)] + '20', color: STAGE_COLORS[['New','Contacted','Qualified','Proposal Sent','Won','Lost'].indexOf(lead.status)] }}>
                      {lead.status}
                    </span>
                    {lead.value > 0 && <p className="text-[10px] text-slate-400 mt-0.5">${lead.value.toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD COMPONENT ────────────────── */
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'Sales Executive';

  const [stats, setStats] = useState({ totalCustomers: 0, customersTrend: '+0%', activeLeads: 0, leadsTrend: '+0%', pendingTasks: 0, urgentTasks: 0, closedDeals: 0, totalRevenue: 0 });
  const [pipeline, setPipeline] = useState({ stages: [], winRate: 0, conversionRate: 0, activePipelineValue: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [urgentTaskList, setUrgentTaskList] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const isAdmin = role === 'Admin';
        const isManager = role === 'Sales Manager';
        const isExec = role === 'Sales Executive';

        const baseRequests = [
          API.get('/dashboard/stats'),
          API.get('/dashboard/pipeline'),
          API.get('/dashboard/revenue'),
          API.get('/dashboard/lead-sources'),
        ];

        if (isAdmin || isManager) {
          baseRequests.push(API.get('/dashboard/team'));
          baseRequests.push(API.get('/tasks?status=Todo'));
        }

        if (isExec) {
          baseRequests.push(API.get('/leads'));
          baseRequests.push(API.get('/tasks'));
        }

        const results = await Promise.all(baseRequests);

        setStats(results[0].data.data);
        setPipeline(results[1].data.data);
        setRevenueData(results[2].data.data);
        setSourceData(results[3].data.data);

        if (isAdmin || isManager) {
          setTeamData(results[4].data.data);
          setUrgentTaskList((results[5].data.data || []).slice(0, 5));
        }

        if (isExec) {
          const allLeads = results[4].data.data || [];
          const allTasks = results[5].data.data || [];
          // Filter to current user's data
          const userId = user?._id;
          setMyLeads(userId ? allLeads.filter(l => l.assignedTo?._id === userId || l.assignedTo === userId) : allLeads);
          setMyTasks(userId ? allTasks.filter(t => t.assignedTo?._id === userId || t.assignedTo === userId) : allTasks);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role, user?._id]);

  if (loading) return <LoadingSpinner />;

  if (role === 'Admin') {
    return <AdminDashboard stats={stats} pipeline={pipeline} revenueData={revenueData} teamData={teamData} sourceData={sourceData} />;
  }
  if (role === 'Sales Manager') {
    return <ManagerDashboard stats={stats} pipeline={pipeline} revenueData={revenueData} teamData={teamData} sourceData={sourceData} urgentTaskList={urgentTaskList} />;
  }
  return <ExecutiveDashboard myLeads={myLeads} myTasks={myTasks} sourceData={sourceData} />;
};

export default Dashboard;
