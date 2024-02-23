const Ajv = require("ajv");
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  useDefaults: "empty",
});
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
require("ajv-keywords")(ajv, "transform");

// Cattle Details schema for validating cattle data
const cattleDetailsSchema = {
  type: "array",
  items: {
    type: "object",
    required: ["type", "number", "averageDailyFeed"],
    properties: {
      type: { type: "string" },
      number: { type: "number", minimum: 1 },
      averageDailyFeed: { type: "number", minimum: 1 },
    },
    errorMessage: {
      required: {
        type: "Please submit animal type",
        number: "Please add number of cattle",
        averageDailyFeed: "Please add average daily feed of animals",
      },
      properties: {
        type: "Animal type should be from the given options",
        number: "Animal count should be a positive integer",
        averageDailyFeed: "Average daily feed should be a positive number",
      },
    },
  },
};

// Validation function for cattle data
const validateCattleDetails = ajv.compile(cattleDetailsSchema);

module.exports = {
  validateCattleDetails,
};
