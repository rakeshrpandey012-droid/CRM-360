const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  convertLead,
  addLeadActivity,
  deleteLead
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize('Admin', 'Sales Manager'), deleteLead);

router.put('/:id/status', updateLeadStatus);
router.put('/:id/assign', assignLead);
router.post('/:id/convert', convertLead);
router.post('/:id/activities', addLeadActivity);

module.exports = router;
