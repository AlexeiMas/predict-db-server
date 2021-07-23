const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/filters');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  search: Joi.string().trim(),
});

const subQuerySchema = Joi.object({
  primary: Joi.string().trim().required(),
  search: Joi.string().trim(),
});

router.get(
  '/diagnosis',
  validator.query(querySchema),
  authMiddleware,
  controller.tumours.diagnosisTypes,
);

router.get(
  '/primary',
  validator.query(querySchema),
  authMiddleware,
  controller.tumours.primaryTypes,
);

router.get(
  '/sub',
  validator.query(subQuerySchema),
  authMiddleware,
  controller.tumours.subTypes,
);

module.exports = router;
