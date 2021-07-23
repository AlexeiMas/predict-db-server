const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/auth');

const router = Router();

const bodySchema = Joi.object({
  email: Joi.string().email().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  companyName: Joi.string().trim().required(),
  jobTitle: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
  password_confirmation: Joi
    .any()
    .valid(Joi.ref('password'))
    .required(),
});
router.post(
  '/',
  validator.body(bodySchema),
  controller.signUp,
);

module.exports = router;
