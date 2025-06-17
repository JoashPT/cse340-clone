const utilities = require('./index');
const {body, validationResult} = require('express-validator');
const invModel = require('../models/inventory-model');
const validate = {};

/* *************************
Deliver classification rules
************************* */
validate.classificationRules = () => {
    console.log('classification rules executes')
    return[
        body("classification_name")
            .notEmpty()
            .isString()
            .isAlpha()
            .withMessage("Only use letters in this field.")
            .custom(async (classification_name) => {
                const classExists = await invModel.checkExistingClassification(classification_name);
                if (classExists) {
                    throw new Error("Classification already exists.")
                }
            })
    ]
}

/* ******************************
 * Check data and return errors or continue to add class
 * ***************************** */
validate.checkClassificationData = async(req, res, next) => {
    console.log("check classification data executes")
    const {classification_name} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            greet,
            classification_name,
        })
        return
    }
    next()
}

/* *************************
Deliver inventory rules
************************* */
validate.inventoryRules = () => {
    console.log('inventory rules executes')
    return[
        //classification_id
        body("classification_id")
            .notEmpty()
            .withMessage("Please provide a classification."),


        //inv_make
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a make."),

        //inv_model
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a model."),

        //inv_year
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:4, max:4})
            .withMessage("Please provide a valid year."),

        //inv_description
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a description."),

        //inv_price
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:1})
            .withMessage("Please provide a price."),

        //inv_miles
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:1})
            .withMessage("Please provide a mile."),

        //inv_color
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isAlpha()
            .isLength({min:1})
            .withMessage("Please provide a color.")
    ]
}

/*
 * Check data and return errors or continue to add inventory
 */
validate.checkInventoryData = async(req, res, next) => {
    console.log("check inventory data executes")
    let classificationList = await utilities.buildClassificationList();
    const {classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            greet,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classificationList
        })
        return
    }
    next()
}

/* *************************
Deliver inventory rules
************************* */
validate.newInventoryRules = () => {
    console.log('inventory rules executes')
    return[
        //classification_id
        body("classification_id")
            .notEmpty()
            .withMessage("Please provide a classification."),

        //inv_id
        body("inv_id")
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide an ID."),


        //inv_make
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a make."),

        //inv_model
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a model."),

        //inv_year
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:4, max:4})
            .withMessage("Please provide a valid year."),

        //inv_description
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a description."),

        //inv_image
        body("inv_image")
            .trim()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide and image."),

        //inv_thumbnail
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .isLength({min:1})
            .withMessage("Please provide a thumbnail."),

        //inv_price
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:1})
            .withMessage("Please provide a price."),

        //inv_miles
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min:1})
            .withMessage("Please provide a mile."),

        //inv_color
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isAlpha()
            .isLength({min:1})
            .withMessage("Please provide a color.")
    ]
}

/*
 * Check data and return errors or continue to update inventory
 */
validate.checkUpdateData = async(req, res, next) => {
    console.log("check update data executes")
    let classificationList = await utilities.buildClassificationList();
    const {classification_id, inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const greet = await utilities.accountGreet(req, res);
        res.render("inventory/update-inventory", {
            errors,
            title: "Edit Vehicle",
            nav,
            greet,
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
            inv_color,
            classificationList
        })
        return
    }
    next()
}


module.exports = validate