const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/filters');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  search: Joi.string().trim(),
});

router.get(
  '/treatment',
  validator.query(querySchema),
  authMiddleware,
  controller.responses.treatmentTypes,
);

router.get(
  '/response',
  validator.query(querySchema),
  authMiddleware,
  controller.responses.responseTypes,
);

module.exports = router;
