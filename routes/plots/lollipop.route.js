const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/plots');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  geneSymbol: Joi.string().trim().default('TP53'),
});

router.get(
  '/generate-plot',
  validator.query(querySchema),
  authMiddleware,
  controller.lollipop,
);

module.exports = router;
