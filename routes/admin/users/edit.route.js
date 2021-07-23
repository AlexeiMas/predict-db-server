const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/users');
const authMiddleware = require('../../../middlewares/auth.middleware');

const router = Router();

const paramsSchema = Joi.object({
  id: Joi.string().trim().required(),
});
const bodySchema = Joi.object({
  email: Joi.string().email().trim().optional(),
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  companyName: Joi.string().trim().optional(),
  jobTitle: Joi.string().trim().optional(),
  password: Joi.string().trim().optional(),
  enabled: Joi.boolean().optional(),
  confirmed: Joi.boolean().default(true).optional(),
});
router.put(
  '/:id',
  validator.params(paramsSchema),
  validator.body(bodySchema),
  authMiddleware,
  controller.edit,
);

module.exports = router;
