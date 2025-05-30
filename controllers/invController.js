const invModel = require('../models/inventory-model');
const utilities = require('../utilities/index');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    console.log("classification Id: ", classification_id);
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
    console.table(req.params);
    const inventory_id = req.params.inventoryId;
    console.log(`inventory_id: ${inventory_id}`);
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

module.exports = invCont