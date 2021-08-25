const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../controllers/search.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

const DEFAULT_LIMIT = Number(process.env.DEFAULT_LIMIT) || 20;

const VALUES = ['NGS', 'Patient Treatment History', 'Growth Characteristics', 'Plasma', 'PBMC', 'PDC Model Treatment Response'];

const querySchema = Joi.object({
  gene: Joi.array().max(20).items(Joi.string().trim()).single(),
  alias: Joi.array().max(20).items(Joi.string().trim()).single(),
  protein: Joi.array().max(20).items(Joi.string().trim()).single(),
  modelId: Joi.array().items(Joi.string().trim()).single(),
  diagnosis: Joi.array().items(Joi.string().trim()).single(),
  tumourType: Joi.array().items(Joi.string().trim()).single().default([]),
  tumourSubType: Joi.array().items(Joi.string().trim()).single().default([]),
  historyCollection: Joi.array().items(Joi.string().trim()).single(),
  historyTreatment: Joi.array().items(Joi.string().trim()).single(),
  historyResponseType: Joi.array().items(Joi.string().trim()).single(),
  responsesTreatment: Joi.array().items(Joi.string().trim()).single(),
  responsesResponseType: Joi.array().items(Joi.string().trim()).single(),
  dataAvailable: Joi.array().items(Joi.string().valid(...VALUES).trim()).single().default([]),
  includeExpressions: Joi.boolean().default(false),
  limit: Joi.number().default(DEFAULT_LIMIT),
  offset: Joi.number().default(0),
  sort: Joi.string().trim().default('PDC Model'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller,
);

module.exports = router;
