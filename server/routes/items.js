const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/items - List items with search & filter
router.get(
  '/',
  [
    query('search').optional().trim().escape(),
    query('category').optional().isIn(['Electronics', 'Clothing', 'Books', 'Keys', 'Wallet', 'Other']),
    query('status').optional().isIn(['Lost', 'Found', 'Resolved']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { search, category, status, page = 1, limit = 12 } = req.query;
      const filter = {};

      if (search) {
        filter.$text = { $search: search };
      }
      if (category) {
        filter.category = category;
      }
      if (status) {
        filter.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [items, total] = await Promise.all([
        Item.find(filter)
          .populate('reportedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Item.countDocuments(filter),
      ]);

      res.json({
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('List items error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/items - Create new item
router.post(
  '/',
  auth,
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('description').trim().notEmpty().withMessage('Description is required').escape(),
    body('category').isIn(['Electronics', 'Clothing', 'Books', 'Keys', 'Wallet', 'Other']).withMessage('Invalid category'),
    body('status').optional().isIn(['Lost', 'Found']).withMessage('Status must be Lost or Found'),
    body('location').trim().notEmpty().withMessage('Location is required').escape(),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, description, category, status, location } = req.body;

      const item = await Item.create({
        title,
        description,
        category,
        status: status || 'Lost',
        location,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        reportedBy: req.user._id,
      });

      const populated = await item.populate('reportedBy', 'name email');
      res.status(201).json(populated);
    } catch (error) {
      console.error('Create item error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PATCH /api/items/:id/resolve - Admin resolve item
router.patch(
  '/:id/resolve',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const item = await Item.findByIdAndUpdate(
        req.params.id,
        { status: 'Resolved' },
        { new: true }
      ).populate('reportedBy', 'name email');

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json(item);
    } catch (error) {
      console.error('Resolve item error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
