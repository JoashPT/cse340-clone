const bcrypt = require('bcryptjs')
const utilities = require('../utilities/index')
const accountModel = require('../models/account-model')

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/register", {
        title: "Register",
        nav,
        errors: null
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const {account_firstname, account_lastname, account_email, account_password} = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration.");
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    );

    if (regResult) {
        req.flash(
            'notice',
            `Congratulations, you\'re registered ${account_firstname}. Please Log in`
        );
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
    console.log("process login");
    let nav = await utilities.getNav();
    const {account_email, account_password} = req.body;
    const regResult = await accountModel.checkValidAccount(
        account_email,
        account_password
    );
    if (regResult.rowCount == 1) {
        console.log("login successful")
        req.flash(
            'notice',
            `Congratulations, you\'re logged in.`
        );
        res.status(200).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        console.log("does not work")
        req.flash('notice', "Sorry, the login failed.")
        res.status(501).render("account/login", {
            title: "Registration",
            nav,
        })
    }
}


module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount,
    loginAccount
}