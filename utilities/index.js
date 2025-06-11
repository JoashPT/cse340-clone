const invModel = require("../models/inventory-model");
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
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req,res,next)).catch(next);

module.exports = Util