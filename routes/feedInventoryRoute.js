const express = require("express");
const { addFeedData, getFeedData } = require("../controllers/feedInventoryController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addFeedData", AuthVerify, addFeedData);
router.get("/getFeedData", AuthVerify, getFeedData);

module.exports = router;