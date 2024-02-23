const asyncHandler = require("express-async-handler");
const CattleDetails = require("../models/cattleModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { validateCattleDetails } = require("../validations/cattleDetailsSchema");

// To add cattle details
const addCattle = asyncHandler(async (req, res) => {
  data = req.body;
  valid = validateCattleDetails(data);

  if (valid) {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).send("user not found");
    }
    
    try {
      const existingCattleDetails = await CattleDetails.findOne({ userId: req.user._id });

      if (existingCattleDetails) {
        return res.status(400).json({ error: "Cattle details already exist. Try updating them instead." });
      }
  
      await new CattleDetails({
        userId: user._id,
        animalDetails: data,
      }).save();
      res.status(200).json({ success: true, message: "Cattle Details saved" });
    } catch (error) {
      res.status(500).json(error);
    }

  } else {
    const errors = validateCattleDetails.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }
});

// To update Cattle data
const updateCattle = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;
  const valid = validateCattleDetails(data);

  if (!valid) {
    const errors = validateCattleDetails.errors;
    const msg = errors.map(({ message }) => message);
    return res.status(400).json({ error: msg });
  }

  try {
    const existingCattleDetails = await CattleDetails.findOne({ userId });

    if (!existingCattleDetails) {
      return res.status(404).json({ error: "Cattle details not found for this user" });
    }

    existingCattleDetails.animalDetails = data;

    await existingCattleDetails.save();
    return res.status(200).json({ success: true, message: "Cattle Details updated" });
  } catch (error) {
    return res.status(500).json(error);
  }
});


module.exports = {
  addCattle,
  updateCattle,
};
