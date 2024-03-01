const asyncHandler = require("express-async-handler");
const FeedDetails = require("../models/feedInventoryModel");
const ActiveFeedLogModel = require("../models/activeFeedLogModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { validateFeedInventory } = require("../validations/feedInventorySchema");

// To add cattle details
const addFeedData = asyncHandler(async (req, res) => {
  data = req.body;
  const {
    feedName,
    animalTypes,
    feedQuantity,
    startDate,
    vendorName,
    purchasePrice,
    purchaseDate,
    txnID,
  } = req.body;
  valid = validateFeedInventory(data);

  if (valid) {
    const user = await User.findById(req.user._id);

    user_id = req.user._id

    if (!user) {
      res.status(404).send("user not found");
    }

    try {
    
    
      const recentInventoryRecord = await FeedDetails.findOne({ userId: user_id, feedName: feedName }).sort({ createdAt: -1 }).exec();

      if (recentInventoryRecord) {
        recentInventoryRecord.status = "active";
        await recentInventoryRecord.save();
      }

      await new FeedDetails({
        userId: user._id,
        status: "Newly Active",
        inStock: "High",
        feedName: feedName,
        animalTypes: animalTypes,
        feedQuantity: feedQuantity,
        startDate: startDate,
        vendorName: vendorName,
        purchasePrice: purchasePrice,
        purchaseDate: purchaseDate,
        txnID: txnID,
      }).save();

    
      const activeFeedLog = await ActiveFeedLogModel.findOne({ userId: user._id, feedName: feedName }).exec();

      if(!activeFeedLog){
        await new ActiveFeedLogModel({
            userId: user._id,
            feedName: feedName,
            animalTypes: animalTypes,
            feedQuantity: feedQuantity,
          }).save();
      }else{
        activeFeedLog.animalTypes = animalTypes; 
        activeFeedLog.feedQuantity += feedQuantity; 
        await activeFeedLog.save();
      }

      res.status(200).json({ success: true, message: "FeedDetails saved" });
    } catch (error) {
      res.status(500).json(error);
    }

  } else {
    const errors = validateFeedInventory.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
});


// To get cattle details
const getFeedData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch data from MongoDB, sorting by status and createdAt
    const feedData = await FeedDetails.find({ userId: userId })
      .sort({ 
        status: 1, 
        createdAt: -1
      })
      .exec();
  
    if (!feedData) {
      return res.status(403).json({ error: "Feed data not found for this user" });
    }
  
    // Define custom order for status values
    const statusOrder = { "newly active": 1, "active": 2, "inactive": 3 };
  
    // Custom sorting based on status
    feedData.sort((a, b) => {
      return statusOrder[a.status] - statusOrder[b.status];
    });
  
    // Send the sorted data in the response
    res.status(200).json({ success: true, data: feedData });
  } catch (error) {
    // Handle errors
    res.status(500).json(error);
  }

});



// To get cattle details by ID
const getFeedDataByID = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const feedId = req.params.feedId;

  try {
    // Fetch data from MongoDB, sorting by status and createdAt
    const feedData = await FeedDetails.findOne({ _id: feedId, userId: userId });
  
    if (!feedData) {
      return res.status(403).json({ error: "Feed details not found" });
    }
  
    // Define custom order for status values
    const statusOrder = { "newly active": 1, "active": 2, "inactive": 3 };
  
    // Custom sorting based on status
    res.status(200).json({ success: true, data: feedData });
  } catch (error) {
    // Handle errors
    res.status(500).json(error);
  }

});



// To get Active cattle details from active-feedlogs DB
const getActiveFeedData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch data from MongoDB, sorting by status and createdAt
    const activeFeedData = await ActiveFeedLogModel.find({ userId: userId })
      .sort({ 
        feedQuantity: -1, 
      })
      .exec();
  
    if (!activeFeedData) {
      return res.status(403).json({ error: "Feed data not found for this user" });
    }
  
    // Send the activeFeedData in the response
    res.status(200).json({ success: true, data: activeFeedData });
  } catch (error) {
    // Handle errors
    res.status(500).json(error);
  }

});



// To get Update cattle details if only active
const updateActiveFeedDataByID = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const feedId = req.params.feedId;
  data = req.body;
  const {
    feedName,
    animalTypes,
    feedQuantity,
    startDate,
    vendorName,
    purchasePrice,
    purchaseDate,
    txnID,
  } = req.body;
  valid = validateFeedInventory(data);

  if (valid) {

    try {
      // Check if the feed exists and is active
      const feedData = await FeedDetails.findOne({ 
        _id: feedId, 
        userId: userId, 
        status: { $in: ["active", "Newly Active"] } 
    });    
      if (!feedData) {
        return res.status(403).json({ error: "Feed details not found or feed is not active" });
      }

      const updateObj = {};
  
      // Update FeedDetails
      // Update the properties that need to be updated
      if(feedData.feedQuantity !== feedQuantity){
        const availbleFeedQuantity = feedData.feedQuantity
        updateObj.feedQuantity = feedQuantity; // Update as needed
    
        // Update ActiveFeedLogModel
        const activeFeedLog = await ActiveFeedLogModel.findOne({ userId: userId, feedName: feedName });
    
        if (!activeFeedLog) {
          // Handle case where active feed log entry doesn't exist (this should not happen if the logic is consistent)
          return res.status(404).json({ error: "Active feed log not found" });
        }
    
        const removedOldFeedQuantity  = activeFeedLog.feedQuantity - availbleFeedQuantity
        activeFeedLog.feedQuantity = removedOldFeedQuantity + feedQuantity; 
        await activeFeedLog.save();
      }

      if(feedData.vendorName !== vendorName){
        updateObj.vendorName = vendorName
      }

      if(feedData.purchasePrice !== purchasePrice){
        updateObj.purchasePrice = purchasePrice
      }

      if(feedData.purchaseDate !== purchaseDate){
        updateObj.purchaseDate = purchaseDate
      }

      if(feedData.txnID !== txnID){
        updateObj.txnID = txnID
      }

      if(feedData.startDate !== startDate){
        updateObj.startDate = startDate
      }

      if(feedData.animalTypes !== animalTypes){
        updateObj.animalTypes = animalTypes

        const activeFeedLog = await ActiveFeedLogModel.findOne({ userId: userId, feedName: feedName });
    
        if (!activeFeedLog) {
          // Handle case where active feed log entry doesn't exist (this should not happen if the logic is consistent)
          return res.status(404).json({ error: "Active feed log not found" });
        }

        activeFeedLog.animalTypes =  animalTypes; // Update as needed
        await activeFeedLog.save();
      }

      Object.assign(feedData, updateObj);
      await feedData.save();
  
      res.status(200).json({ success: true, message: "Feed details updated successfully" });
    } catch (error) {
      // Handle errors
      res.status(500).json(error);
    }

  } else {
    const errors = validateFeedInventory.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }

});




module.exports = {
  addFeedData,
  getFeedData,
  getFeedDataByID,
  getActiveFeedData,
  updateActiveFeedDataByID,
};






