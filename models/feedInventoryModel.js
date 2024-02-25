const mongoose = require("mongoose");

const feedInventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    required: true
  },
  inStock: {
    type: String,
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
  startDate: {
    type: Date,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  txnID: {
    type: String,
    required: true
  }
},
{
  timestamps: true,
});

const FeedInventoryModel = mongoose.model("FeedInventory", feedInventorySchema);

module.exports = FeedInventoryModel;
