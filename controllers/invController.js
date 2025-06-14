const invModel = require('../models/inventory-model');
const utilities = require('../utilities/index');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav();
    const className = data[0].classification_name
    res.render('./inventory/classification', {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build car by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    const vehicle = await invModel.getCar(inventory_id);
    const grid = await utilities.buildSpecificCarGrid(vehicle)
    let nav = await utilities.getNav()
    const carName = `${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year}`
    res.render('./inventory/vehicle', {
        title: carName,
        nav,
        grid,
    })
}

/* ***************************
 *  Build error
 * ************************** */
invCont.buildError = async function (req, res, next) {
    console.log('buildError executes');
    const err = new Error('<p class="error">Internal Server Error.</p>');
    err.status = 500
    throw err;
}

/* ***************************
 *  Build management
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render('./inventory/management', {
        title: "Vehicle Management",
        nav,
        errors: null,
        classificationSelect,
    })
}

/* ***************************
 *  Build Add classification
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    console.log('buildAddClassification executes')
    const nav = await utilities.getNav();
    res.render('./inventory/add-classification', {
        title: "Add Classification",
        nav,
        errors: null,
    })
}

/* ***************************
 *  Register New Classification
 * ************************* */
invCont.registerNewClassification = async function (req, res, next) {
    console.log("register classification executes");
    let nav = await utilities.getNav();
    const {classification_name} = req.body;

    const regResult = await invModel.addClassification(classification_name);

    if (regResult) {
        console.log("classification registration success")
        req.flash(
            'notice',
            `Congratulations, you\'ve added a new classification ${classification_name}.`
        );
        res.status(201).render("inventory/management", {
            title: "Vehicle Management",
            nav,
        })
    } else {
        console.log("classification registration fails")
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("inventory/add-classification", {
            title: "Add Classification",
            nav,
        })
    }
}

/* =====================
Build add inventory view
===================== */
invCont.buildAddInventory = async function (req, res, next) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render('./inventory/add-inventory', {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: null,
    })
}

/* ***************************
 *  Add New Vehicle
 * ************************* */
invCont.addVehicle = async function (req, res, next) {
    console.log("add vehicle executes");
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    const {classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color} = req.body;

    const regResult = await invModel.addVehicle(classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color);

    if (regResult) {
        console.log("vehicle registration success")
        req.flash(
            'notice',
            `Congratulations, you\'ve added a new vehicle ${inv_year} ${inv_make} ${inv_model}.`
        );
        res.status(201).render("inventory/management", {
            title: "Vehicle Management",
            nav,
        })
    } else {
        console.log("classification registration fails")
        req.flash('notice', "Sorry, the registration failed.")
        res.status(501).render("inventory/add-inventory", {
            title: "Add Vehicle",
            classificationList,
            nav,
        })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData[0].inv_id) {
        return res.json(invData);
    } else {
        next(new Error("No data returned"));
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************* */
invCont.updateInventory = async function (req, res, next) {
    console.log("update inventory executes");
    let nav = await utilities.getNav();
    const {
        classification_id, 
        inv_id, 
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image,
        inv_thumbnail,
        inv_price, 
        inv_miles, 
        inv_color
    } = req.body;

    const updateResult = await invModel.updateInventory(
        classification_id, 
        inv_id,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image,
        inv_thumbnail,
        inv_price, 
        inv_miles, 
        inv_color);

    if (updateResult) {
        console.log("vehicle update success")
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash(
            'notice',
            `Congratulations, the ${itemName} is successfully updated.`
        );
        res.redirect('/inv/')
        } else {
        console.log("vehicle update fails")
        let classificationList = await utilities.buildClassificationList();
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash('notice', "Sorry, the udpate failed.")
        res.status(501).render("inventory/update-inventory", {
            title: "Edit" + itemName,
            classificationList: classificationList,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/* ***************************
 * Build Inventory Update
 * ************************* */
invCont.buildInventoryUpdate = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav();
    const itemData = await invModel.getCar(inv_id)
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render('./inventory/update-inventory', {
        title: "Edit " + itemName,
        nav,
        classificationList: classificationList,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    })
}

module.exports = invCont