const asyncHandler = require("express-async-handler")
const { validateRegistration } = require("../validations/registerUserSchema");
const User = require("../models/userModel")
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  };

const registerUser = asyncHandler(async(req, res) => {
    data = req.body;
    valid = validateRegistration(data);

    const { fullname, email, password } = data;
    

    if (valid) {
        const userExists = await User.findOne({email});

        if(userExists){
            res.send("user already exists");
        }

                
        const user = await User.create({
            fullname,
            email,
            password
        })

        if(user){
            const { _id, fullname, email } = user;

            //   Generate Token
            const token = generateToken(user._id);

            res.status(201).json({
                _id, fullname, email, token
            })
        }
        else{
            res.send("invalud user data")
        }
    } else {
        const errors = validateRegistration.errors;
        const msg = errors.map(({ message }) => message);
        return res.status(400).json({ error: msg });
    }
   
});

module.exports = {registerUser}