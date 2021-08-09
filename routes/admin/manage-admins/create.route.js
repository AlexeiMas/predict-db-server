const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/manage-admins');

const router = Router();

const bodySchema = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
});

router.post(
  '/',
  validator.body(bodySchema),
  controller.create,
);

module.exports = router;
