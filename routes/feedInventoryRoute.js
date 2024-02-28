const express = require("express");
const { addFeedData, getFeedData, getFeedDataByID, getActiveFeedData } = require("../controllers/feedInventoryController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addFeedData", AuthVerify, addFeedData);
router.get("/getFeedData", AuthVerify, getFeedData);
router.get("/getFeedData/:feedId", AuthVerify, getFeedDataByID);
router.get("/getActiveFeedData", AuthVerify, getActiveFeedData);

module.exports = router;