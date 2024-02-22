const express = require("express");
const { registerUser, loginUser, logoutUser, userProfile, userLoginStatus, userUpdatePassword, userForgotPassword } = require("../controllers/userController");
const AuthVerify = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/userProfile", AuthVerify, userProfile);
router.get("/loginStatus", userLoginStatus);
router.patch("/updatePassword", AuthVerify, userUpdatePassword);
router.post("/forgotPassword", userForgotPassword);

module.exports = router;