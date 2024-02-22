const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");



const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Removes trailing whitespaces
        lowercase: true, // Converts email to lowercase
        validate: {
            validator: validator.isEmail,
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: (password) => {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(password);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character, and be at least 6 characters long'
        }
    },
    photo: {
        type: String,
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
        }
    },

{
    timestamps: true,
});

//   Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  });

const User = mongoose.model('users', userSchema);

module.exports = User;
