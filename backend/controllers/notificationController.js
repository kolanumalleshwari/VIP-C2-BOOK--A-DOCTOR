import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Server error loading notifications' });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  const { id } = req.body; // If empty, mark all read

  try {
    if (id) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { readStatus: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.json({ message: 'Notification marked as read', notification });
    } else {
      // Mark all read
      await Notification.updateMany({ userId: req.user.id, readStatus: false }, { readStatus: true });
      return res.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    console.error('Mark read notifications error:', error.message);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
};
