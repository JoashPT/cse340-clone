const express = require('express');
const router = new express.Router();
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get('/register', utilities.handleErrors(accountController.buildRegistration));
router.post(
    '/register', 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount));
// Process the login attempt
router.post(
    '/login',
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin));
router.get(
    '/',
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildManagement))

module.exports = router;