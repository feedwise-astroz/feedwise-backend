const mongoose = require("mongoose");

const cattleSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  animalDetails: [{
    // Animal type (e.g., cow, bull, calf)
    type: {
      type: String,
      required: true
    },
    // Animal count (e.g., 10 cows, 5 bulls)
    number: {
      type: Number,
      required: true,
      min: 1
    },
    // Daily feed per animal (e.g 100 kgs, 200kgs)
    averageDailyFeed: {
      type: Number,
      required: true,
      min: 1
    }
  }]
});

const CattleDetails = mongoose.model("cattle-details", cattleSchema);
module.exports = CattleDetails;
