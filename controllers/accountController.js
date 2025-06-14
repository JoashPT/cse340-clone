const bcrypt = require('bcryptjs')
const utilities = require('../utilities/index')
const accountModel = require('../models/account-model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav();
    const {account_email, account_password} = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) 
        {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000})
            if (process.env.NODE_ENV === 'development') {
                res.cookie('jwt', accessToken, {httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie('jwt', accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect("/account")
        }
        else {
            req.flash("message notice", "Please check your login credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/management", {
        title: "Account Management",
        nav,
        errors: null
    });
}

module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount,
    loginAccount,
    accountLogin,
    buildManagement
}