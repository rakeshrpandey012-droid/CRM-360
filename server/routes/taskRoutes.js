const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  bulkAssignTasks,
  deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/bulk-assign', bulkAssignTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(authorize('Admin', 'Sales Manager'), deleteTask);

router.put('/:id/status', updateTaskStatus);

module.exports = router;
