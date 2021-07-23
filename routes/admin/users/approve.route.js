const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/users');

const router = Router();

const paramsSchema = Joi.object({
  userId: Joi.string().trim().required(),
  token: Joi.string().trim().required(),
});
router.get(
  '/:userId/:token',
  validator.params(paramsSchema),
  controller.approve,
);

module.exports = router;
