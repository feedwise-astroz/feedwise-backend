const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: "empty" });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
require("ajv-keywords")(ajv, "transform");

ajv.addKeyword({
    keyword: "strongPassword",
    type: "string",
    compile: () => {
        return (data) => {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
            return passwordRegex.test(data);
        };
    }
});

ajv.addKeyword({
    keyword: "passwordMatch",
    compile: () => {
        return (data) => {
            if (data.newPassword !== data.confirmPassword) {
                return false;
            }
            return true;
        };
    },
    errors: false
});

const updatePasswordSchema = {
    type: "object",
    required: ["oldPassword", "newPassword", "confirmPassword"],
    additionalProperties: false,
    properties: {
        oldPassword: { type: "string" },
        newPassword: { type: "string", minLength: 6, strongPassword: true },
        confirmPassword: { type: "string" }
    },
    passwordMatch: true,
    errorMessage: {
        type: "should be an object",
        required: {
            oldPassword: "Please enter old password",
            newPassword: "Please enter new password",
            confirmPassword: "Please confirm new password",
        },
        properties: {
            newPassword: "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character",
            confirmPassword: "Passwords do not match",
        },
        passwordMatch: "New password and confirm password do not match"
    }
};

const validateUpdatePassword = ajv.compile(updatePasswordSchema);

module.exports = {
    validateUpdatePassword
};
