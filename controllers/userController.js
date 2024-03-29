const asyncHandler = require("express-async-handler");
const { validateRegistration } = require("../validations/registerUserSchema");
const { validateLogin } = require("../validations/loginUserSchema");
const User = require("../models/userModel");
const UserToken = require("../models/userTokenModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  validateUpdatePassword,
} = require("../validations/updatePasswordSchema");
const sendMail = require("../utils/sendMail");
const { validateResetPassword } = require("../validations/resetPasswordSchema");

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
      res.status(409).send("User already exists");
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
      res.status(400).send("Invalid user data");
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
      res.status(404).send("This user doesn't have an account. Please sign up!");
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (user && correctPassword) {
      const { _id, fullname, email } = user;

      const token = generateToken({ _id });

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
      photo,
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

  if (!token) {
    return res.status(401).json(false);
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

  if (verifyToken) {
    return res.status(200).json(true);
  }

  return res.status(401).json(false);

});

// To update user account
const userUpdatePassword = asyncHandler(async (req, res) => {
  data = req.body;
  const { oldPassword, newPassword } = req.body;
  valid = validateUpdatePassword(data);

  if (valid) {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(400).send("User not found");
    }

    const correctPassword = await bcrypt.compare(oldPassword, user.password);

    if (user && correctPassword) {
      user.password = newPassword;
      await user.save();
      res.send(200).send("password updated!");
    } else {
      res.status(400).send("Please add old and new passwords");
    }
  } else {
    const errors = validateUpdatePassword.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }

  // res.send("password updated")
});

// When user clicks on forgot password
const userForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).send("email not found");
  }

  let resetTokenExists = await UserToken.findOne({ userId: user._id });
  if (resetTokenExists) {
    await UserToken.deleteOne();
  }

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await new UserToken({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * (60 * 1000), // 10 minutes
  }).save();

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  console.log(user);

  // Reset Email
  const message = `
      <h2>Hello ${user.fullname}</h2>
      <p>A password reset for your account was requested.</p>  
      <p>Please click the URL below to change your password.</p>
      <p>Note that this link is valid for 10 minutes. After the time limit has expired, you will have to resubmit the request for a password reset.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

      <p>If you did not make this request, please contact us at ${process.env.MAIL_USER}.</p>
      
      <p>Regards,</p>
      <p>Feedwise Team</p>
    `;
  const subject = "Reset Password";
  const send_to = user.email;
  const sent_from = process.env.MAIL_USER;

  try {
    await sendMail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500).json("Email not sent, please try again");
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  data = req.body;
  const { password } = req.body;
  valid = validateResetPassword(data);
  const { resetToken } = req.params;

  if (valid) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenDetails = await UserToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!resetTokenDetails) {
      res.status(404);
      throw new Error("Invalid or Expired Token");
    }

    // Find user
    const user = await User.findOne({ _id: resetTokenDetails.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
  } else {
    const errors = validateResetPassword.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  userProfile,
  userLoginStatus,
  userUpdatePassword,
  userForgotPassword,
  resetPassword,
};
