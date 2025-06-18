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
//logout
router.get('/logout', accountController.logoutManagement)
router.get('/edit/:account_id', utilities.handleErrors(accountController.buildAccountEdit))
router.post('/update/',
    regValidate.editContentRules(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.updateAccountContent)
)
router.post('/update/password',
    regValidate.editPassword(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.updateAccountPassword)
)
/* ****************************
 * Router for the final project
 * ************************* */
router.get('/list', utilities.authorizeAdmin, utilities.handleErrors(accountController.buildAccountList))

module.exports = router;