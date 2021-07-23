const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/auth');

const router = Router();

const bodySchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().trim().required(),
});
router.post(
  '/',
  validator.body(bodySchema),
  controller.login,
);

module.exports = router;
