const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  searchPosts
} = require('../controllers/post.controller');
const upload = require('../middleware/upload.middleware');

router.use(protect); // Protect all routes

router.route('/')
  .post(upload.single('image'), createPost)
  .get(getAllPosts);

router.get('/search', searchPosts);

router.route('/:id')
  .get(getPost)
  .put(upload.single('image'), updatePost)
  .delete(deletePost);

module.exports = router; 