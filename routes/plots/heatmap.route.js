const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../controllers/plots');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

const querySchema = Joi.object({
  customGeneList: Joi.string().trim().default(''),
  tumorType: Joi.string().trim().default('Carcinoma, Ductal, Breast'),
});

router.get(
  '/',
  validator.query(querySchema),
  authMiddleware,
  controller.heatmap,
);

module.exports = router;
