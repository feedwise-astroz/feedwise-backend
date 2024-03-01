const express = require("express");
const { addFeedData, getFeedData, getFeedDataByID, getActiveFeedData, updateActiveFeedDataByID } = require("../controllers/feedInventoryController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addFeedData", AuthVerify, addFeedData);
router.get("/getFeedData", AuthVerify, getFeedData);
router.get("/getFeedData/:feedId", AuthVerify, getFeedDataByID);
router.get("/getActiveFeedData", AuthVerify, getActiveFeedData);
router.patch("/updateFeedData/:feedId", AuthVerify, updateActiveFeedDataByID);

module.exports = router;