const Post = require('../models/post.model');

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const post = await Post.create({
      title,
      content,
      tags,
      author: req.user._id,
      image: req.file ? req.file.path : null
    });

    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all posts (with pagination)
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name email')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Post.countDocuments();

    res.status(200).json({
      status: 'success',
      results: posts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { posts }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if user is post author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { post: updatedPost }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if user is post author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this post'
      });
    }

    await post.remove();

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a search query'
      });
    }

    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'name email');

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 