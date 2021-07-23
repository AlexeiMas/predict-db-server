const { Router } = require('express');

const signIn = require('./signIn.route');
const signUp = require('./signUp.route');
const refresh = require('./refresh.route');
const resetPassword = require('./resetPassword.route');

const router = Router();

router.use('/sign-in', signIn);
router.use('/sign-up', signUp);
router.use('/refresh', refresh);
router.use('/reset-password', resetPassword);

module.exports = router;
