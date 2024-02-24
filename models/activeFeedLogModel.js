const mongoose = require("mongoose");

const activeFeedLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  feedName: {
    type: String,
    required: true
  },
  animalTypes: {
    type: [String],
    required: true
  },
  feedQuantity: {
    type: Number,
    required: true
  },
},
{
  timestamps: true,
});

const ActiveFeedLogModel = mongoose.model("active-feedlogs", activeFeedLogSchema);

module.exports = ActiveFeedLogModel;