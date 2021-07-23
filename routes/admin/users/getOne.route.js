const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/users');
const authMiddleware = require('../../../middlewares/auth.middleware');

const router = Router();

const paramsSchema = Joi.object({
  id: Joi.string().trim().required(),
});
router.get(
  '/:id',
  validator.params(paramsSchema),
  authMiddleware,
  controller.getOne,
);

module.exports = router;
