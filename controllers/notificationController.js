const asyncHandler = require("express-async-handler");
const Notifications = require("../models/notificationModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// To post notifications
const sendNotifications = asyncHandler(async (req, res) => {

    console.log("send notifications")
});

// To get notifications
const getNotifications = asyncHandler(async (req, res) => {

    console.log("send notifications")
});

// To get notifications by ID
const getNotificationByID = asyncHandler(async (req, res) => {

    console.log("send notifications")
});



module.exports = {
    sendNotifications,
    getNotifications,
    getNotificationByID,
  };
  