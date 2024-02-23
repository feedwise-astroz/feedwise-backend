const express = require("express");
const { addCattle, updateCattle, getCattleData } = require("../controllers/cattleController");
const AuthVerify = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/addCattle", AuthVerify, addCattle);
router.get("/getCattleData", AuthVerify, getCattleData);
router.patch("/updateCattle", AuthVerify, updateCattle);

module.exports = router;