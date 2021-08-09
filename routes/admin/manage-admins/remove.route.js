const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/manage-admins');

const router = Router();

const bodySchema = Joi.object({
  ids: Joi.array().items(Joi.string().trim()).required(),
});

router.delete(
  '/',
  validator.body(bodySchema),
  controller.remove,
);

module.exports = router;
