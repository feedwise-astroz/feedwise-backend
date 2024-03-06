const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// To get notifications
const getNotificationsCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
      // Find unread notifications count for the user
    const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      if (!unreadCount) {
        return res.status(201).json({ success: true, message: "No New Notifications Found" });
      }
  
      return res.status(200).json({ success: true, data: unreadCount });
    } catch (error) {
      return res.status(500).json(error);
    }
});

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        // Find notifications for the user
        const notifications = await Notification.find({ userId }).sort({
          createdAt: -1,
        });

        if(!notifications){
            return res.status(201).json({ success: true, message: "No Notifications Found" });
        }
    
        res.status(200).json({ success: true, data: notifications });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
});

// To get notifications by ID
const getNotificationByID = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notificationID = req.params.notificationID;

    try {
      // Find notification by ID
      const notification = await Notification.findById({_id: notificationID, userId: userId});
  
      if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
      }
  
      // Mark the notification as read
      notification.isRead = true;
      await notification.save();
  
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});



module.exports = {
    getNotificationsCount,
    getNotifications,
    getNotificationByID,
  };