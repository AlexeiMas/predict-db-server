const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/auth');

const router = Router();

router.post(
  '/',
  validator.body(Joi.object({
    email: Joi.string().email().trim().required(),
  })),
  controller.resetPassword.sendRecoveryLink,
);

router.get(
  '/:token',
  validator.params(Joi.object({
    token: Joi.string().trim().required(),
  })),
  controller.resetPassword.checkToken,
);

router.post(
  '/:userId/:token',
  validator.params(Joi.object({
    userId: Joi.string().trim().required(),
    token: Joi.string().trim().required(),
  })),
  validator.body(Joi.object({
    password: Joi.string().trim().required(),
    password_confirmation: Joi
      .any()
      .valid(Joi.ref('password'))
      .required(),
  })),
  controller.resetPassword.setupNewPassword,
);

module.exports = router;
