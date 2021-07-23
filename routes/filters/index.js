const { Router } = require('express');
const tumours = require('./tumours.route');
const history = require('./history.route');
const responses = require('./responses.route');
const models = require('./models.route');
const genes = require('./genes.route');

const router = Router();

router.use('/tumours', tumours);
router.use('/history', history);
router.use('/responses', responses);
router.use('/models', models);
router.use('/genes', genes);

module.exports = router;
