const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const AuthVerify = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Not Authorized");
  }

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(verifyToken.id).select("-password");

    if (!user) {
      return res.status(401).send("User not found");
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).send("Not Authorized");
  }
});

module.exports = AuthVerify;
