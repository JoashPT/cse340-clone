const pool = require('../database/index');

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassifictionsbyid error" + error)
    }
}

/* ***************************
 *  Get all data for one car
 * ************************** */
async function getCar(inventory_id) {
    try {
        const inv_key = inventory_id;
        const car = await pool.query(
            `SELECT * FROM public.inventory AS i WHERE i.inv_id = $1`, [inv_key]
        )
        return car.rows[0]
    } catch (error) {
        console.error("getCar error " + error)
    }
}


async function checkExistingClassification(classification_name) {
    try {
        console.log("checking existing classification")
        const sql = "SELECT * FROM classification WHERE classification_name = $1";
        const classification = await pool.query(sql, [classification_name]);
        return classification.rowCount;
    } catch (error) {
        return error.message;
    }
}

/* ***************************
 *  Add classification data
 * ************************** */
async function addClassification(classification_name) {
    try {
        console.log("adding classification")
        return await pool.query(`INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`, [classification_name])
    } catch (error) {
        console.error("Add classification error " + error)
    }
}

/* ***************************
 *  Add new vehicle data
 * ************************** */
async function addVehicle(classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color) {
    try {
        console.log("add vehicle executing");
        const sql = `INSERT INTO inventory 
        (classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '/images/vehicles/no-image.png', '/images/vehicles/no-image-tn.png') 
        RETURNING *`
        return await pool.query(sql, [classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color]);
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Update vehicle data
 * ************************** */
async function updateInventory(
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
    inv_color) {
    try {
        console.log("update vehicle executing");
        const sql = `UPDATE public.inventory 
        SET
        classification_id = $1,
        inv_make = $3,
        inv_model = $4,
        inv_year = $5,
        inv_description = $6,
        inv_image = $7,
        inv_thumbnail = $8,
        inv_price = $9,
        inv_miles = $10,
        inv_color = $11
        WHERE inv_id = $2
        RETURNING *`;
        const data = await pool.query(sql, [
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
        ])
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* ***************************
 *  Delete vehicle data
 * ************************** */
async function deleteInventory(inv_id) {
    try {
        console.log("delete vehicle executing");
        const sql = `DELETE FROM public.inventory WHERE inv_id = $1`;
        const data = await pool.query(sql, [inv_id])
        return data;
    } catch (error) {
        console.error("Delete Inventory Error")
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getCar,
    checkExistingClassification,
    addClassification,
    addVehicle,
    updateInventory,
    deleteInventory
}