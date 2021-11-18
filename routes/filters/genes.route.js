const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/filters');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const DEFAULT_LIMIT = 20;

const querySchema = Joi.object({
  search: Joi.array().items(Joi.string().trim().allow('')).single().default([]),
  limit: Joi.number().default(DEFAULT_LIMIT),
  offset: Joi.number().default(0),
  strictEqual: Joi.boolean().default(false),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller.genes,
);

module.exports = router;
