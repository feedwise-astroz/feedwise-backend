const express = require("express");
const { addFeedData } = require("../controllers/feedInventoryController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addFeedData", AuthVerify, addFeedData);

module.exports = router;