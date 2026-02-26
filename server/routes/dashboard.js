const express = require('express');
const Item = require('../models/Item');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalLost,
      totalFound,
      totalResolved,
      totalItems,
      lastWeekItems,
      prevWeekItems,
      categoryStats,
    ] = await Promise.all([
      Item.countDocuments({ status: 'Lost' }),
      Item.countDocuments({ status: 'Found' }),
      Item.countDocuments({ status: 'Resolved' }),
      Item.countDocuments(),
      Item.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Item.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
      Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const activeItems = totalLost + totalFound;
    const recoveryRate = totalItems > 0
      ? Math.round((totalResolved / totalItems) * 100)
      : 0;
    const weeklyGrowth = prevWeekItems > 0
      ? Math.round(((lastWeekItems - prevWeekItems) / prevWeekItems) * 100)
      : lastWeekItems > 0 ? 100 : 0;

    res.json({
      totalLost,
      totalFound,
      totalResolved,
      activeItems,
      recoveryRate,
      weeklyGrowth,
      categoryStats,
      systemHealth: 'online',
    });
  } catch (error) {
    console.error('Metrics error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/recent - Recent reports (admin)
router.get('/recent', auth, requireRole('admin'), async (req, res) => {
  try {
    const items = await Item.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(items);
  } catch (error) {
    console.error('Recent reports error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
