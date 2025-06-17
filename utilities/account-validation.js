const utilities = require('./index');
const {body, validationResult} = require('express-validator');
const accountModel = require('../models/account-model');
const validate = {};

/* ****************************************
*  Deliver registration view
* *************************************** */
validate.registrationRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a first name."),

        // lastname is required and must be a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a last name."),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email already exists. Please sign in using an unregistered email.")
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowerCase: 1,
                minUpperCase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async(req, res, next) => {
    const {account_firstname, account_lastname, account_email, account_password} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            greet,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ****************************************
*  Deliver login view
* *************************************** */
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (!emailExists) {
                    throw new Error("Please use a registered email.")
                }
            })
    ]
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async(req, res, next) => {
    console.log("check login data executes")
    const {account_email, account_password} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            greet,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors if inv_id matches in cookies and url
 * ***************************** */
validate.checkLoginEdit = async(req, res, next) => {
    console.log("check login edit executes")
    const url_id = parseInt(req.params.account_id);
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        let cookie_id = parseInt(payload.account_id);
        if (url_id = cookie_id) {
            next();
        }
    } else {
        req.flash('notice', 'Please edit your own account');
        res.redirect('/account');
    }
}

/*
validating edit content
*/
validate.editContentRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a first name."),

        // lastname is required and must be a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a last name."),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email already exists. Please sign in using an unregistered email.")
                }
            })
        ]
}

validate.editPassword = () => {
    // password is required and must be strong password
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowerCase: 1,
                minUpperCase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkEditData = async(req, res, next) => {
    const {account_firstname, account_lastname, account_email} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("account/update-account", {
            errors,
            title: "Registration",
            nav,
            greet,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate;