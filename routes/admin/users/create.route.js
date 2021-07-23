const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/users');
const authMiddleware = require('../../../middlewares/auth.middleware');

const router = Router();

const bodySchema = Joi.object({
  email: Joi.string().email().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  companyName: Joi.string().trim().required(),
  jobTitle: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
  enabled: Joi.boolean().required(),
  confirmed: Joi.boolean().default(true).optional(),
});
router.post(
  '/',
  validator.body(bodySchema),
  authMiddleware,
  controller.create,
);

module.exports = router;
