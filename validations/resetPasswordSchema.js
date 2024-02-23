const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: "empty" })
require("ajv-errors")(ajv)
require("ajv-formats")(ajv)
require("ajv-keywords")(ajv, "transform")


ajv.addKeyword({
    keyword: "strongPassword", 
    type: "string",           
    compile: () => {
        // Return a function that performs validation
        return (data) => {
            // Regular expression pattern for strong password
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

            // Check if the data matches the pattern and return the result
            return passwordRegex.test(data);
        };
    }
});


ajv.addKeyword({
  keyword: "passwordMatch", 
  compile: () => {
    return (data) => {
        if (data.password !== data.confirmPassword) {
            return false;
        }
        return true;
    };
  },
  errors: false 
});

// resetPasswordSchema schema for validating registration data
const resetPasswordSchema = {
  type: "object",
  required: ["password", "confirmPassword"],
  additionalProperties: false,
  properties: {
    password: { type: "string", minLength: 6, strongPassword: true },
    confirmPassword: { type: "string" }
},
  passwordMatch: true,  
  errorMessage: {
    type: "should be an object", 
    required: {
        password: "Please enter password",
        confirmPassword: "Please confirm password",
    },
    properties: {
        password: "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one digit",
        confirmPassword: "Passwords do not match",
        
    },
    passwordMatch: "Passwords do not match"
}
  
};

// Validation function for reset password data
const validateResetPassword = ajv.compile(resetPasswordSchema);

module.exports = {
    validateResetPassword
};
