const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/manage-admins');

const router = Router();

const paramsSchema = Joi.object({ adminId: Joi.string().trim().required() });

router.get(
  '/:adminId',
  validator.params(paramsSchema),
  controller.get,
);

module.exports = router;
