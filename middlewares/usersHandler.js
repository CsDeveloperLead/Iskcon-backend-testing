const Joi = require('joi');
const errorHandler = require('./errorHandler');

function signUpValidation(req,res,next) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(64).required(),
        email: Joi.string().email(),
        phone_no: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be exactly 10 digits'),  // Validates a 10-digit phone number (adjust pattern as needed)
        password: Joi.string().min(4).max(100).required().messages({
            'string.min': 'Password must be at least 4 characters long.',
            'string.max': 'Password must be at most 100 characters long.',
            'any.required': 'Password is required.'
          }),
        user_role: Joi.string().valid('iskcon-admin', 'iskcon-user').required().messages({
            'string.base': 'User role must be a string.',
            'any.required': 'User role is required.'
          }),
        userId: Joi.string(),
        isIskconMembership: Joi.boolean()
    });
    const {error} = schema.validate(req.body);
    console.log('Validation Error :::::', error);
    // if(error){
    //     return errorHandler(error, req, res);
    // }
    next();
}

const loginValidation = (req,res,next) => {
    // need to be implemented

}

module.exports = {
    signUpValidation,
    loginValidation
}