const { Router } = require('express');

const createRoute = require('./create.route');
const getRoute = require('./get.route');
const listRoute = require('./list.route');
const removeRoute = require('./remove.route');
const updateRoute = require('./update.route');

const router = Router();

router.use('/', createRoute);
router.use('/', getRoute);
router.use('/', listRoute);
router.use('/', removeRoute);
router.use('/', updateRoute);

module.exports = router;
