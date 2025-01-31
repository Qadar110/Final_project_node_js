const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');

router.use(protect);

// Regular user routes
router.get('/me', getMe);
router.put('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// Admin only routes
router.use(authorize('admin'));
router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 