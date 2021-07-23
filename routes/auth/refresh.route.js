const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/auth');

const router = Router();

const bodySchema = Joi.object({
  token: Joi.string().trim().required(),
});
router.post(
  '/',
  validator.body(bodySchema),
  controller.refresh,
);

module.exports = router;
