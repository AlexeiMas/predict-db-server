const { Router } = require('express');

const login = require('./login.route');

const router = Router();

router.use('/login', login);

module.exports = router;
