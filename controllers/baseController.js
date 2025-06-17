const utilities = require('../utilities/');
const baseController = {};

baseController.buildHome = async function(req, res) {
    console.log("basebuilder executes")
    const nav = await utilities.getNav();
    const greet = await utilities.accountGreet(req, res);
    console.log(greet);
    req.flash('notice', 'This is a flash message.');
    res.render('index', {title: 'Home', greet, nav});
}

module.exports = baseController