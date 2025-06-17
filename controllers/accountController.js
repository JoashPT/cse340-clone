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
    const greet = await utilities.accountGreet(req, res);
    res.render("./account/login", {
        title: "Login",
        nav,
        greet,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    res.render("./account/register", {
        title: "Register",
        nav,
        greet,
        errors: null
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
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
            greet,
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
            greet,
        })
    } else {
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            greet,
        })
    }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
    console.log("process login");
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
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
            greet,
        })
    } else {
        console.log("does not work")
        req.flash('notice', "Sorry, the login failed.")
        res.status(501).render("account/login", {
            title: "Registration",
            nav,
            greet,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    const {account_email, account_password} = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            greet,
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
                greet,
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
    let accountManagement = await utilities.accountManagement(req, res);
    const greet = await utilities.accountGreet(req, res);
    res.render("./account/management", {
        title: "Account Management",
        nav,
        greet,
        accountManagement,
        errors: null
    });
}

/* ****************************************
*  Logout function
* *************************************** */
async function logoutManagement(req, res, next) {
    try {
        res.clearCookie('jwt')
        req.flash(
            'notice',
            `You\'ve logged out.`)
        res.redirect('/')
    } catch (error) {
        console.log("error" + error.msg)
        req.flash("notice", "Sorry there was an error logging out");
        res.redirect('/');
    }
}

/* ****************************************
*  Deliver account edit view
* *************************************** */
async function buildAccountEdit(req, res, next) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        console.table(payload);
        console.log(payload.account_id)
        res.render("./account/update-account", {
        title: "Edit Account",
        nav,
        greet,
        account_firstname: payload.account_firstname,
        account_lastname: payload.account_lastname,
        account_email: payload.account_email,
        account_id: payload.account_id,
        errors: null
    })
    } else {
        req.flash('notice', 'Please edit your own account');
        res.redirect('/account');
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function updateAccountContent(req, res) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    const {account_firstname, account_lastname, account_email, account_id} = req.body;

    const regResult = await accountModel.updateAccountContent(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    );

    if (regResult) {
        console.table(regResult)
        console.log('regResult for account content')
        req.flash(
            'notice',
            `Congratulations, you\'ve updated ${account_firstname}`
        );
        res.status(201).redirect('/account')
    } else {
        console.log('content update failed')
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("account/update-account", {
            title: "Edit Account",
            nav,
            greet,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
            errors: null
        })
    }
}

async function updateAccountPassword(req, res) {
    let nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    const {account_password, account_id, account_firstname, account_lastname, account_email} = req.body;

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
            greet,
            errors: null,
        })
    }
    console.log("account_id: " + account_id)
    const regResult = await accountModel.updateAccountPassword(
        hashedPassword,
        account_id
    );

    if (regResult) {
        console.table(regResult)
        console.table("update account password last stage")
        req.flash(
            'notice',
            `Congratulations, you\'ve updated your password`
        );
        res.status(201).redirect('/account')
    } else {
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("account/update-account", {
            title: "Registration",
            nav,
            greet,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
            errors: null
        })
    }
}

module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount,
    loginAccount,
    accountLogin,
    buildManagement,
    logoutManagement,
    buildAccountEdit,
    updateAccountContent,
    updateAccountPassword
}