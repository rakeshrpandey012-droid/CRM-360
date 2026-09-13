const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get main dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const totalCustomers = await Customer.countDocuments({ isDeleted: false });
  const activeLeads = await Lead.countDocuments({ status: { $nin: ['Won', 'Lost'] } });
  const pendingTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });
  const urgentTasks = await Task.countDocuments({ priority: 'Urgent', status: { $ne: 'Completed' } });

  const wonLeads = await Lead.find({ status: 'Won' });
  const closedDeals = wonLeads.length;
  const totalRevenue = wonLeads.reduce((acc, lead) => acc + (lead.value || 0), 0);

  res.json({
    success: true,
    status: 200,
    data: {
      totalCustomers,
      customersTrend: '+12.5%',
      activeLeads,
      leadsTrend: '+8.3%',
      pendingTasks,
      urgentTasks,
      closedDeals,
      totalRevenue
    }
  });
});

// @desc    Get pipeline analytics
// @route   GET /api/dashboard/pipeline
// @access  Private
const getPipeline = asyncHandler(async (req, res) => {
  const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  const leads = await Lead.find();

  const stageBreakdown = stages.map(stage => {
    const stageLeads = leads.filter(l => l.status === stage);
    return {
      stage,
      count: stageLeads.length,
      value: stageLeads.reduce((sum, l) => sum + (l.value || 0), 0)
    };
  });

  const wonCount = leads.filter(l => l.status === 'Won').length;
  const lostCount = leads.filter(l => l.status === 'Lost').length;
  const closedCount = wonCount + lostCount;
  const totalLeads = leads.length;

  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

  const activePipelineValue = leads
    .filter(l => !['Won', 'Lost'].includes(l.status))
    .reduce((sum, l) => sum + (l.value || 0), 0);

  res.json({
    success: true,
    status: 200,
    data: {
      stages: stageBreakdown,
      winRate,
      conversionRate,
      activePipelineValue,
      totalLeads
    }
  });
});

// @desc    Get monthly revenue trend
// @route   GET /api/dashboard/revenue
// @access  Private
const getRevenueTrend = asyncHandler(async (req, res) => {
  const monthlyData = [
    { month: 'May', revenue: 42000, target: 40000, deals: 3 },
    { month: 'Jun', revenue: 58000, target: 50000, deals: 5 },
    { month: 'Jul', revenue: 64000, target: 60000, deals: 4 },
    { month: 'Aug', revenue: 79000, target: 70000, deals: 6 },
    { month: 'Sep', revenue: 95000, target: 80000, deals: 7 },
    { month: 'Oct', revenue: 112000, target: 90000, deals: 8 }
  ];

  res.json({
    success: true,
    status: 200,
    data: monthlyData
  });
});

// @desc    Get team performance metrics
// @route   GET /api/dashboard/team
// @access  Private
const getTeamPerformance = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ['Sales Executive', 'Sales Manager'] } }).select('name email role avatar');
  const leads = await Lead.find();

  const teamMetrics = users.map(user => {
    const userLeads = leads.filter(l => l.assignedTo && l.assignedTo.toString() === user._id.toString());
    const wonLeads = userLeads.filter(l => l.status === 'Won');
    const totalWonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const conversion = userLeads.length > 0 ? Math.round((wonLeads.length / userLeads.length) * 100) : 0;

    return {
      _id: user._id,
      name: user.name,
      role: user.role,
      assignedLeads: userLeads.length,
      closedWon: wonLeads.length,
      revenueGenerated: totalWonValue,
      conversionRate: `${conversion}%`
    };
  });

  res.json({
    success: true,
    status: 200,
    data: teamMetrics
  });
});

// @desc    Get lead sources breakdown
// @route   GET /api/dashboard/lead-sources
// @access  Private
const getLeadSources = asyncHandler(async (req, res) => {
  const leads = await Lead.find();
  const sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];

  const breakdown = sources.map(source => ({
    source,
    count: leads.filter(l => l.source === source).length
  }));

  res.json({
    success: true,
    status: 200,
    data: breakdown
  });
});

module.exports = {
  getStats,
  getPipeline,
  getRevenueTrend,
  getTeamPerformance,
  getLeadSources
};
