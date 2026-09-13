const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserRole,
  createUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('Admin', 'Sales Manager'), createUser);

router.get('/me', (req, res) => res.json({ success: true, data: req.user }));

router.route('/:id')
  .get(getUserById)
  .delete(authorize('Admin'), deleteUser);

router.put('/:id/role', authorize('Admin'), updateUserRole);

module.exports = router;
