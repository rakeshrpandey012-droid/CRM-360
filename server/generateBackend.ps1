# controllers/customerController.js
$customerController = @'
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');

exports.getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { isDeleted: false };
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query).skip(startIndex).limit(limit);

  res.json({
    success: true,
    status: 200,
    data: customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, status: 201, data: customer });
});
'@
Set-Content -Path .\controllers\customerController.js -Value $customerController -Encoding UTF8

# controllers/leadController.js
$leadController = @'
const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');

exports.getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find();
  res.json({ success: true, status: 200, data: leads });
});

exports.createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create(req.body);
  res.status(201).json({ success: true, status: 201, data: lead });
});
'@
Set-Content -Path .\controllers\leadController.js -Value $leadController -Encoding UTF8

# routes/customerRoutes.js
$customerRoutes = @'
const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCustomers).post(protect, createCustomer);

module.exports = router;
'@
Set-Content -Path .\routes\customerRoutes.js -Value $customerRoutes -Encoding UTF8

# routes/leadRoutes.js
$leadRoutes = @'
const express = require('express');
const router = express.Router();
const { getLeads, createLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getLeads).post(protect, createLead);

module.exports = router;
'@
Set-Content -Path .\routes\leadRoutes.js -Value $leadRoutes -Encoding UTF8

