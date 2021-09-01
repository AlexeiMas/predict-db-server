/* eslint-disable newline-per-chained-call */
const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  gene: Joi.array().max(20).items(Joi.string().trim()).single().default(''),
  alias: Joi.array().max(20).items(Joi.string().trim()).single().default(''),
  protein: Joi.array().max(20).items(Joi.string().trim()).single().default(''),
  modelId: Joi.array().items(Joi.string().trim()).single().default(''),
  diagnosis: Joi.array().items(Joi.string().trim()).single().default(''),
  tumourType: Joi.array().items(Joi.string().trim()).single().default(''),
  tumourSubType: Joi.array().items(Joi.string().trim()).single().default(''),
  historyCollection: Joi.array().items(Joi.string().trim()).single().default(''),
  historyTreatment: Joi.array().items(Joi.string().trim()).single().default(''),
  historyResponseType: Joi.array().items(Joi.string().trim()).single().default(''),
  responsesTreatment: Joi.array().items(Joi.string().trim()).single().default(''),
  responsesResponseType: Joi.array().items(Joi.string().trim()).single().default(''),
  includeExpressions: Joi.boolean().default(false),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller,
);

module.exports = router;
