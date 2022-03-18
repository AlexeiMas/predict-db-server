const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/plots');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  geneSymbol1: Joi.string().trim().default('KRAS'),
  geneSymbol2: Joi.string().trim().default('TP53'),
  categoricalValue: Joi.string().trim().default('Age'),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller.scatter,
);

module.exports = router;
