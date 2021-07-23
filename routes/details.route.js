const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../controllers/details.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  tumourType: Joi.array().items(Joi.string().trim()).single(),
  tumourSubType: Joi.array().items(Joi.string().trim()).single(),
});

const ngsQuerySchema = Joi.object({
  gene: Joi.array().items(Joi.string().trim()).single(),
  alias: Joi.array().items(Joi.string().trim()).single(),
  protein: Joi.array().items(Joi.string().trim()).single(),
  includeExpressions: Joi.boolean().default(false),
});

router.get(
  '/general/:modelId',
  authMiddleware,
  controller.general,
);
router.get(
  '/clinical/:modelId',
  authMiddleware,
  controller.clinical,
);
router.get(
  '/history/:modelId',
  validator.query(querySchema),
  authMiddleware,
  controller.history,
);
router.get(
  '/responses/:modelId',
  validator.query(querySchema),
  authMiddleware,
  controller.responses,
);
router.get(
  '/ngs/:modelId',
  validator.query(ngsQuerySchema),
  authMiddleware,
  controller.ngs,
);

module.exports = router;
