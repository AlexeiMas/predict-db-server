const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/plots');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  geneArr: Joi.array().items(Joi.string().trim()).default(['TP53', 'ROCK1', 'PKM']),
  tumourTypes: Joi.array().items(Joi.string().trim()).default('Carcinoma, Ductal, Breast'),
});

router.get(
  '/generate-plot',
  validator.query(querySchema),
  authMiddleware,
  controller.oncoprint,
);

module.exports = router;
