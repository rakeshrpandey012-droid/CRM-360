const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const Task = require('../models/Task');

// @desc    Get all customers with pagination, search, and filtering
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { isDeleted: false };

  // Status Filter
  if (req.query.status && req.query.status !== 'All') {
    query.status = req.query.status;
  }

  // Search Filter
  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex }
    ];
  }

  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .populate('assignedTo', 'name email role avatar')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.json({
    success: true,
    status: 200,
    data: customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
});

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, isDeleted: false })
    .populate('assignedTo', 'name email role phone');

  if (!customer) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'Customer not found'
    });
  }

  const activities = await Activity.find({ 'relatedTo.itemId': customer._id })
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  const tasks = await Task.find({ 'relatedTo.itemId': customer._id })
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    status: 200,
    data: {
      customer,
      activities,
      tasks
    }
  });
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, status, assignedTo, address, notes, industry } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Customer name and email are required'
    });
  }

  const customer = await Customer.create({
    name,
    email: email.toLowerCase(),
    phone,
    company,
    status: status || 'Active',
    assignedTo: assignedTo || req.user._id,
    address,
    notes,
    industry: industry || 'Technology'
  });

  await Activity.create({
    type: 'Note',
    description: `Customer account "${customer.name}" created`,
    relatedTo: { itemType: 'Customer', itemId: customer._id },
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Customer created successfully',
    data: customer
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  let customer = await Customer.findOne({ _id: req.params.id, isDeleted: false });

  if (!customer) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'Customer not found'
    });
  }

  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email role');

  await Activity.create({
    type: 'Note',
    description: `Customer details updated by ${req.user.name}`,
    relatedTo: { itemType: 'Customer', itemId: customer._id },
    createdBy: req.user._id
  });

  res.json({
    success: true,
    status: 200,
    message: 'Customer updated successfully',
    data: customer
  });
});

// @desc    Soft delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: 'Customer not found'
    });
  }

  customer.isDeleted = true;
  await customer.save();

  await Activity.create({
    type: 'Note',
    description: `Customer soft-deleted by ${req.user.name}`,
    relatedTo: { itemType: 'Customer', itemId: customer._id },
    createdBy: req.user._id
  });

  res.json({
    success: true,
    status: 200,
    message: 'Customer deleted successfully'
  });
});

// @desc    Add activity/note to customer
// @route   POST /api/customers/:id/activities
// @access  Private
const addCustomerActivity = asyncHandler(async (req, res) => {
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
    relatedTo: { itemType: 'Customer', itemId: req.params.id },
    createdBy: req.user._id
  });

  await activity.populate('createdBy', 'name email role');

  res.status(201).json({
    success: true,
    status: 201,
    message: 'Activity added successfully',
    data: activity
  });
});

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerActivity
};
