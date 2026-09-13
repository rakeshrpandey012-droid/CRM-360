const express = require('express');
const router = express.Router();
const {
  getStats,
  getPipeline,
  getRevenueTrend,
  getTeamPerformance,
  getLeadSources
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.get('/pipeline', getPipeline);
router.get('/revenue', getRevenueTrend);
router.get('/team', getTeamPerformance);
router.get('/lead-sources', getLeadSources);

module.exports = router;
