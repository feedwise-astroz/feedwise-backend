const mongoose = require("mongoose");

// Define notification schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  notificationType:{
    type: String,
    required: true
  },
  feedName:{
    type: String,
    required: true
  },
  feedQuantity:{
    type: Number,
    required: true
  },
  inStock:{
    type: String,
    required: true
  },
  isRead:{
    type: String,
    required: true
  },
  daysLeftToEnd:{
    type: String
  },
  message: {
    type: String,
    required: true
  }
},
{
  timestamps: true,
});

// Create Notification model
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
