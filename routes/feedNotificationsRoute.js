const express = require("express");
const AuthVerify = require("../middleware/authMiddleware");
const { getNotificationByID, sendNotifications, getNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.post("/notifications", sendNotifications);
router.get("/notifications", AuthVerify, getNotifications);
router.get("/notifications/:notificationID", AuthVerify, getNotificationByID);

module.exports = router;