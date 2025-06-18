const invModel = require("../models/inventory-model");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
        list += "<li>";
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classfication_name +
            ' vehicles">' +
            row.classification_name +
            "</a>" ;
        list += "</li>";
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
    let grid;
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            +'" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            +' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr/>';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        })
        grid += '</ul>';
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}

/* **************************************
* Build the specific car view HTML
* ************************************ */
Util.buildSpecificCarGrid = async function(vehicle) {
    let grid;
    //if (vehicle.length > 0) {
        grid = '<section id="car-display">'
            grid += '<div>';
            grid += '<img src="' + vehicle.inv_image + '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model +' on CSE Motors"/>';
            grid += '</div>';
            grid += '<ul class="carSpec">';
            grid += '<li><span class="strongText">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</span></li>';
            grid += '<li><span class="strong">Price:</span> $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</li>';
            grid += '<li><span class="strong">Description:</span> ' + vehicle.inv_description + '</li>';
            grid += '<li><span class="strong">Color:</span> ' + vehicle.inv_color + '</li>';
            grid += '<li><span class="strong">Miles:</span> ' + new Intl.NumberFormat('en-Us').format(vehicle.inv_miles) + '</li>'
            grid += '</ul>';
        grid += '</section>';
    //} else {
        //grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    //}
    return grid;
}

/* **************************************
* Build the option select view HTML
* ************************************ */
Util.buildClassificationList = async function(classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList = 
        `<select name="classification_id" id="classification_id" name="classification_id" required>`
    classificationList += "<option value='' disabled>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList +=
        '<option value="' + row.classification_id + '"'
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie('jwt')
                    return res.redirect('/account/login')
                }
                res.locals.accountData = accountData    
                res.locals.loggedin = 1
                next()
            })
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

Util.accountGreet = async (req, res, next) => {
    let tools = '<ul>';
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        let firstname = payload.account_firstname;
        tools += `<li><a href="/account">Welcome ${firstname}</a></li>`;
        tools += '<li><a href="/account/logout" title="Click to log out">Logout</a></li>';
    } else {
        tools += '<li><a href="/account/login" title="Click to log in">My Account</a></li>';
    }
    tools += '</ul>'
    return tools;
}

Util.authorizeAccount = async (req, res, next) => {
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        let type = payload.account_type;
        if (type == 'Employee' || type == 'Admin') {
            next()
        } else {
            req.flash('notice', 'You are not authorized to use this section')
            res.redirect('/')
        }
    } else {
        req.flash('notice', "Please login as 'Employee' or 'Administrator' before proceeding")
        res.redirect('/')
    }
}

Util.accountManagement = async (req, res, next) => {
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        let type = payload.account_type;
        let name = payload.account_firstname;
        let id = parseInt(payload.account_id)
        let message = '<div class="management">'
        message += `<h2>Welcome, ${name}</h2>`;
        message += `<p><a href="/account/edit/${id}">Edit Account</a></p>`
        if (type == 'Employee' || type == 'Admin') {
            message += '<h3>Inventory Management<h3>';
            message += '<p><a href="/inv/">Inventory Management</a></p>';
        }
        if (type == 'Admin') {
            message += '<h3>List of Accounts<h3>';
            message += '<p><a href="/account/list">List of accounts</a></p>';
        }
        message += '</div>'
        return message;
    } else {
        req.flash('notice', "Please login as 'Employee' or 'Administrator' before proceeding")
        res.redirect('/')
    }
}

/* *************************
 * Middleware for the final project
 * Validates only the 'Admin'
 * ********************** */
Util.authorizeAdmin = async (req, res, next) => {
    if (req.cookies.jwt) {
        let payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
        let type = payload.account_type;
        if (type == 'Admin') {
            next()
        } else {
            req.flash('notice', 'You are not authorized to use this section')
            res.redirect('/')
        }
    } else {
        req.flash('notice', "Please login as an 'Administrator' before proceeding")
        res.redirect('/')
    }
}

/* *************************
 * Deliver table for the final project
 * ********************** */
Util.userTable = async (dataList) => {
    let tableContent = "";
    console.log(dataList)
    dataList.forEach(item => {
        tableContent += '<tr>'
        tableContent += `<td>${item.account_firstname}</td>`
        tableContent += `<td>${item.account_lastname}</td>`
        tableContent += `<td>${item.account_email}</td>`
        tableContent += `<td>${item.account_type}</td>`
        tableContent += '</tr>'
    });
    return tableContent;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req,res,next)).catch(next);

module.exports = Util