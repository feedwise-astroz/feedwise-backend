const asyncHandler = require("express-async-handler");
const { validateRegistration } = require("../validations/registerUserSchema");
const { validateLogin } = require("../validations/loginUserSchema");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { request } = require("express");
const crypto =  require("crypto")
const { validateUpdatePassword } = require("../validations/updatePasswordSchema");

// To generate a JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// To register the user
const registerUser = asyncHandler(async (req, res) => {
  data = req.body;
  valid = validateRegistration(data);

  const { fullname, email, password } = data;

  if (valid) {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.send("user already exists");
    }

    const user = await User.create({
      fullname,
      email,
      password,
    });

    if (user) {
      const { _id, fullname, email } = user;

      //  Generate Token
      const token = generateToken(_id);

      //  Send cookie
      res.cookie("token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        maxAge: 86400000, // Setting maxAge to expire the cookie after 24 hours
        secure: true,
      });

      res.status(201).json({
        _id,
        fullname,
        email,
        token,
      });
    } else {
      res.send("invalud user data");
    }
  } else {
    const errors = validateRegistration.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
});

// To Login the user
const loginUser = asyncHandler(async (req, res) => {
  data = req.body;
  valid = validateLogin(data);

  const { email, password } = data;

  if (valid) {
    const user = await User.findOne({ email });

    if (!user) {
      res.send("This user doesn't have an account, Please do singup!");
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (user && correctPassword) {
      const { _id, fullname, email } = user;

      const token = generateToken({_id});

      //  Send cookie
      res.cookie("token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        maxAge: 86400000, // Setting maxAge to expire the cookie after 24 hours
        secure: true,
      });

      res.status(201).json({
        _id,
        fullname,
        email,
        token,
      });
    } else {
      return res
        .status(400)
        .json({ error: "Username or Password is not correct" });
    }
  } else {
    const errors = validateLogin.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
});

// to get the user profile data
const userProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo } = user;
        res.status(200).json({
          _id,
          name,
          email,
          photo
        });
      } else {
        res.status(400);
        throw new Error("User Not Found");
      }

});

// To Logout the user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    maxAge: 0, // Setting maxAge to expire the cookie after 24 hours
    secure: true,
  });
  return res.status(200).json({ message: "Successfully logged out" });
});

// To get user login status
const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if(!token){
    return res.json(false)
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

  if(verifyToken){
    return res.json(true)
  }

  return res.json(false)

  res.send("status")
});

// To update user account
const userUpdatePassword = asyncHandler(async (req, res) => {
  data = req.body;
  const {oldPassword, newPassword} = req.body;
  valid = validateUpdatePassword(data);

  if(valid){
    const user = await User.findById(req.user._id);
    if(!user){
      res.status(400).send("User not found")
    }
  
    const correctPassword = await bcrypt.compare(oldPassword, user.password);

    if (user && correctPassword) {
      user.password = newPassword;
      await user.save()
      res.send(200).send("password updated!")
    }else{
      res.status(400).send("Please add old and new passwords")
    }



  }else {
    const errors = validateUpdatePassword.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
  

 
  // res.send("password updated")
});

const userForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).send("email not found")
  }
  
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  res.status(404).send("crypto created")
});

module.exports = { registerUser, loginUser, logoutUser, userProfile, userLoginStatus, userUpdatePassword, userForgotPassword };
