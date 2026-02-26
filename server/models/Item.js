const mongoose = require('mongoose');

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Keys', 'Wallet', 'Other'];
const STATUSES = ['Lost', 'Found', 'Resolved'];

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: [true, 'Category is required'],
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'Lost',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: 200,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
