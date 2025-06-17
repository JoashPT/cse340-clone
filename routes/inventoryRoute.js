// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const invClassValidate = require('../utilities/vehicle-class-validation');
const utilities = require('../utilities/index');

// Route to build inventory by classification view
router.get('/type/:classificationId', utilities.handleErrors(invController.buildByClassificationId));
router.get('/detail/:inventoryId', utilities.handleErrors(invController.buildByInventoryId));
router.get('/error', utilities.handleErrors(invController.buildError));
router.get('/', utilities.handleErrors(invController.buildManagement));
router.get('/addclassification', utilities.handleErrors(invController.buildAddClassification));
router.post(
    '/addclassification',
    invClassValidate.classificationRules(),
    invClassValidate.checkClassificationData,
    utilities.handleErrors(invController.registerNewClassification)
    );
router.get('/addvehicle', utilities.handleErrors(invController.buildAddInventory));
router.post(
    '/addvehicle',
    invClassValidate.inventoryRules(),
    invClassValidate.checkInventoryData,
    utilities.handleErrors(invController.addVehicle)
);
router.get('/getInventory/:classification_id', utilities.handleErrors(invController.getInventoryJSON));
router.get('/edit/:inv_id', utilities.handleErrors(invController.buildInventoryUpdate));
router.post(
    '/update/',
    invClassValidate.newInventoryRules(),
    invClassValidate.checkUpdateData, 
    utilities.handleErrors(invController.updateInventory));
router.get('/delete/:inv_id', utilities.handleErrors(invController.buildInventoryDelete));
router.post('/delete/', utilities.handleErrors(invController.deleteInventory))

module.exports = router;