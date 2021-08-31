const { Router } = require('express');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator();
const controller = require('../../../controllers/admin/manage-admins');

const router = Router();

const querySchema = Joi.object({
  filter: Joi.string().optional().description('Optional query param'),
  range: Joi.string().optional().description('Optional query param'),
  limit: Joi.number().optional().default(20).description('Optional query param. Default 20'),
  skip: Joi.number().optional().default(0).description('Optional query param. Default 0'),
  sort: Joi.string().optional().replace('id', '_id').description('Optional query param'),
});

router.get(
  '/',
  validator.query(querySchema),
  controller.list,
);

module.exports = router;
