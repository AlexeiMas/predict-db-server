const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/manage-admins');

const router = Router();

const paramsSchema = Joi.object({ adminId: Joi.string().trim().required() });

const bodySchema = Joi.object({
  _id: Joi.string().strip(true),
  email: Joi.string().trim().optional(),
  password: Joi.string().trim().optional(),
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
});

router.put(
  '/:adminId',
  validator.params(paramsSchema),
  validator.body(bodySchema),
  controller.update,
);

module.exports = router;
