const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc    Get all leads with filters
// @route   GET /api/leads
// @access  Private
const getLeads = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.status && req.query.status !== 'All') {
    query.status = req.query.status;
  }

  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: 'i' };
    query.$or = [
      { title: searchRegex },
      { contactName: searchRegex },
      { contactEmail: searchRegex },
      { company: searchRegex }
    ];
  }

  if (req.query.assignedTo) {
    query.assignedTo = req.query.assignedTo;
  }

  const leads = await Lead.find(query)
    .populate('assignedTo', 'name email role')
    .populate('customerId', 'name company email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    status: 200,
    data: leads
  });
});

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email role phone')
    .populate('customerId', 'name email company');

  if (!lead) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'Lead not found'
    });
  }

  const activities = await Activity.find({ 'relatedTo.itemId': lead._id })
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    status: 200,
    data: {
      lead,
      activities
    }
  });
});

// @desc    Create lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler(async (req, res) => {
  const { title, contactName, contactEmail, contactPhone, company, status, value, source, assignedTo, notes } = req.body;

  if (!title || !contactName || !contactEmail) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Title, contact name, and contact email are required'
    });
  }

  const assignee = assignedTo || req.user._id;

  const lead = await Lead.create({
    title,
    contactName,
    contactEmail: contactEmail.toLowerCase(),
    contactPhone,
    company,
    status: status || 'New',
    value: Number(value) || 0,
    source: source || 'Website',
    assignedTo: assignee,
    notes
  });

  await lead.populate('assignedTo', 'name email role');

  await Activity.create({
    type: 'Note',
    description: `Lead "${lead.title}" created with status ${lead.status}`,
    relatedTo: { itemType: 'Lead', itemId: lead._id },
    createdBy: req.user._id
  });

  if (assignee.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: assignee,
      title: 'New Lead Assigned',
      message: `You were assigned lead: "${lead.title}" (${lead.company || lead.contactName})`,
      type: 'lead',
      link: '/leads'
    });
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Lead created successfully',
    data: lead
  });
});

// @desc    Update lead details
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email role');

  if (!lead) {
    return res.status(404).json({ success: false, status: 404, message: 'Lead not found' });
  }

  res.json({
    success: true,
    status: 200,
    message: 'Lead updated successfully',
    data: lead
  });
});

// @desc    Update lead status (Pipeline stage)
// @route   PUT /api/leads/:id/status
// @access  Private
const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  if (!validStages.includes(status)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `Invalid status stage. Allowed stages: ${validStages.join(', ')}`
    });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, status: 404, message: 'Lead not found' });
  }

  const prevStatus = lead.status;
  lead.status = status;
  await lead.save();

  await Activity.create({
    type: 'Status Change',
    description: `Pipeline stage moved from "${prevStatus}" to "${status}" by ${req.user.name}`,
    relatedTo: { itemType: 'Lead', itemId: lead._id },
    createdBy: req.user._id
  });

  if (lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: lead.assignedTo,
      title: 'Lead Stage Updated',
      message: `Lead "${lead.title}" moved to ${status}`,
      type: 'lead',
      link: '/leads'
    });
  }

  await lead.populate('assignedTo', 'name email role');

  res.json({
    success: true,
    status: 200,
    message: `Lead stage updated to ${status}`,
    data: lead
  });
});

// @desc    Assign lead to user
// @route   PUT /api/leads/:id/assign
// @access  Private
const assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ success: false, status: 404, message: 'Lead not found' });
  }

  lead.assignedTo = assignedTo;
  await lead.save();
  await lead.populate('assignedTo', 'name email role');

  await Activity.create({
    type: 'Note',
    description: `Lead assigned to ${lead.assignedTo.name}`,
    relatedTo: { itemType: 'Lead', itemId: lead._id },
    createdBy: req.user._id
  });

  await Notification.create({
    recipient: assignedTo,
    title: 'Lead Assigned',
    message: `You were assigned lead "${lead.title}"`,
    type: 'lead',
    link: '/leads'
  });

  res.json({
    success: true,
    status: 200,
    message: 'Lead assigned successfully',
    data: lead
  });
});

// @desc    Convert lead to customer (One-click)
// @route   POST /api/leads/:id/convert
// @access  Private
const convertLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ success: false, status: 404, message: 'Lead not found' });
  }

  if (lead.isConverted) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'This lead has already been converted into a customer account.'
    });
  }

  // Create new Customer
  let customer = await Customer.findOne({ email: lead.contactEmail.toLowerCase(), isDeleted: false });
  if (!customer) {
    customer = await Customer.create({
      name: lead.contactName,
      email: lead.contactEmail.toLowerCase(),
      phone: lead.contactPhone,
      company: lead.company || `${lead.contactName} Company`,
      status: 'Active',
      assignedTo: lead.assignedTo || req.user._id,
      notes: `Converted from lead "${lead.title}". Deal value: $${lead.value}`
    });
  }

  lead.status = 'Won';
  lead.isConverted = true;
  lead.customerId = customer._id;
  await lead.save();

  await Activity.create({
    type: 'Conversion',
    description: `Lead converted to customer "${customer.name}" by ${req.user.name}`,
    relatedTo: { itemType: 'Lead', itemId: lead._id },
    createdBy: req.user._id
  });

  await Activity.create({
    type: 'Conversion',
    description: `Customer created via one-click lead conversion from "${lead.title}"`,
    relatedTo: { itemType: 'Customer', itemId: customer._id },
    createdBy: req.user._id
  });

  res.json({
    success: true,
    status: 200,
    message: 'Lead converted to customer successfully',
    data: {
      customer,
      lead
    }
  });
});

// @desc    Add activity/note to lead
// @route   POST /api/leads/:id/activities
// @access  Private
const addLeadActivity = asyncHandler(async (req, res) => {
  const { type, description } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Activity description is required'
    });
  }

  const activity = await Activity.create({
    type: type || 'Note',
    description,
    relatedTo: { itemType: 'Lead', itemId: req.params.id },
    createdBy: req.user._id
  });

  await activity.populate('createdBy', 'name email role');

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Activity logged successfully',
    data: activity
  });
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, status: 404, message: 'Lead not found' });
  }

  res.json({
    success: true,
    status: 200,
    message: 'Lead deleted successfully'
  });
});

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  convertLead,
  addLeadActivity,
  deleteLead
};
