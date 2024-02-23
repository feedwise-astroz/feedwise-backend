const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: "empty" })
require("ajv-errors")(ajv)
require("ajv-formats")(ajv)
require("ajv-keywords")(ajv, "transform")


ajv.addFormat("email", (data) => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(data);
});


// Login schema for validating login data
const loginSchema = {
  type: "object",
  required: ["email", "password"],
  additionalProperties: false,
  properties: {
    email: { type: "string", format: "email", maxLength: 40, transform: ["trim"] },
    password: { type: "string"},
},
  errorMessage: {
    type: "should be an object", 
    required: {
        email: "Please enter email",
        password: "Please enter password",
    },
    properties: {
        email: "Invalid email format",
    },
}
  
};

// Validation function for login data
const validateLogin = ajv.compile(loginSchema);

module.exports = {
    validateLogin
};
