const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  gene: Joi.array().max(20).items(Joi.string().trim()).single(),
  alias: Joi.array().max(20).items(Joi.string().trim()).single(),
  protein: Joi.array().max(20).items(Joi.string().trim()).single(),
  modelId: Joi.array().items(Joi.string().trim()).single(),
  diagnosis: Joi.array().items(Joi.string().trim()).single(),
  tumourType: Joi.array().items(Joi.string().trim()).single(),
  tumourSubType: Joi.array().items(Joi.string().trim()).single(),
  historyCollection: Joi.array().items(Joi.string().trim()).single(),
  historyTreatment: Joi.array().items(Joi.string().trim()).single(),
  historyResponseType: Joi.array().items(Joi.string().trim()).single(),
  responsesTreatment: Joi.array().items(Joi.string().trim()).single(),
  responsesResponseType: Joi.array().items(Joi.string().trim()).single(),
  includeExpressions: Joi.boolean().default(false),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller,
);

module.exports = router;
