const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getUsers);
router.get('/me', (req, res) => res.json({ success: true, data: req.user }));
router.get('/:id', getUserById);

module.exports = router;
