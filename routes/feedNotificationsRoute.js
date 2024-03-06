const express = require("express");
const AuthVerify = require("../middleware/authMiddleware");
const { getNotificationByID, getNotifications, getNotificationsCount } = require("../controllers/notificationController");

const router = express.Router();

router.get("/notificationsCount",AuthVerify, getNotificationsCount);
router.get("/notifications", AuthVerify, getNotifications);
router.get("/notifications/:notificationID", AuthVerify, getNotificationByID);

module.exports = router;