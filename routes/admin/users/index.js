const { Router } = require('express');

const getList = require('./getList.route');
const getOne = require('./getOne.route');
const create = require('./create.route');
const edit = require('./edit.route');
const remove = require('./delete.route');
const approve = require('./approve.route');

const router = Router();

router.use('/', getList);
router.use('/', getOne);
router.use('/', create);
router.use('/', edit);
router.use('/', remove);
router.use('/approve', approve);

module.exports = router;
