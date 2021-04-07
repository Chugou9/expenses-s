//Validation
const Joi = require('@hapi/joi');

const validationSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
});

/**
 * Validates register route.
 *
 * @param {*} data Request body.
 */
function isRegisterValid(data) {
    return validationSchema.validate(data);
}

const loginSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
});

/**
 * Validates login route.
 *
 * @param {*} data Request body.
 */
function isLoginValid(data) {
    return loginSchema.validate(data);
}

module.exports.isRegisterValid = isRegisterValid;
module.exports.isLoginValid = isLoginValid;