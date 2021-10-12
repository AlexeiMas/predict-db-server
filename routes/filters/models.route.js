const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/filters');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  search: Joi.array().items(Joi.string().trim().allow('')).single().default([]),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller.models,
);

module.exports = router;
