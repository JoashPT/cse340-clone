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
    console.log("process registration");
    console.table(req.body);
    let nav = await utilities.getNav();
    const {account_firstname, account_lastname, account_email, account_password} = req.body;
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    );

    if (regResult) {
        console.table(regResult);
        req.flash(
            'notice',
            `Congratulations, you\'re registered ${account_firstname}. Please Log in`
        );
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        console.log("does not work")
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}

module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount
}