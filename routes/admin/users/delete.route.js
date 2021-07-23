const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/users');
const authMiddleware = require('../../../middlewares/auth.middleware');

const router = Router();

const bodySchema = Joi.object({
  ids: Joi.array().items(Joi.string().trim()).required(),
});
router.delete(
  '/',
  validator.body(bodySchema),
  authMiddleware,
  controller.delete,
);

module.exports = router;
