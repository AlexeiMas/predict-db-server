const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/plots');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  geneSymbol: Joi.string().trim().default('BRAF'),
  categoricalValue: Joi.string().trim().default('Age'),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller.violin,
);

module.exports = router;
