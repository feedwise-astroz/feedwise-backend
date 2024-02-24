const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: "empty" });
require("ajv-errors")(ajv);
require("ajv-keywords")(ajv, "transform");

// Custom format validation function for "mm/dd/yyyy" format
ajv.addFormat("date-mm-dd-yyyy", {
  type: "string",
  validate: (data) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/; // Regular expression for "mm/dd/yyyy" format
    return regex.test(data);
  }
});

const feedInventorySchema = {
  type: "object",
  required: ["feedName", "animalTypes", "feedQuantity", "startDate"],
  properties: {
    status: { type: "string" },
    feedName: { type: "string" },
    animalTypes: { type: "array", items: { type: "string" } },
    feedQuantity: { type: "number", minimum: 0 },
    startDate: { type: "string", format: "date-mm-dd-yyyy" }, 
    vendorName: { type: "string" },
    purchasePrice: { type: "number", minimum: 0 },
    purchaseDate: { type: "string", format: "date-mm-dd-yyyy" }, 
    txnID: { type: "string" }
  },
  errorMessage: {
    required: {
      feedName: "Feed name is required",
      animalTypes: "Animal types are required",
      feedQuantity: "Feed quantity is required",
      startDate: "Start date is required",
    },
    properties: {
      status: "Feed status must be provided",
      feedName: "Feed name must be provided",
      animalTypes: "Animal type must be selected atleast 1",
      feedQuantity: "Feed quantity must be a positive number",
      startDate: "Start date must be in mm/dd/yyyy format",
      vendorName: "Vendor name must be provided",
      purchasePrice: "Purchase price must be positive amount",
      purchaseDate: "Purchase date must be in mm/dd/yyyy format",
      txnID: "Transaction ID must be provided"
    }
  }
};

const validateFeedInventory = ajv.compile(feedInventorySchema);

module.exports = {
  validateFeedInventory
};