const express = require("express");
const { addCattle, updateCattle } = require("../controllers/cattleController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addCattle", AuthVerify, addCattle);
router.patch("/updateCattle", AuthVerify, updateCattle);

module.exports = router;