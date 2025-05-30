const pool = require('../database/index');

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    console.log("executed getClassification function")
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        console.log("before execute!!!")
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        console.log(data.rows)
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
        const inv_key = inventory_id.slice(6);
        console.log("inventory_id", inv_key);
        const car = await pool.query(
            `SELECT * FROM public.inventory AS i WHERE i.inv_id = $1`, [inv_key]
        )
        console.log(car.rows[0]);
        return car.rows[0]
    } catch (error) {
        console.error("getCar error " + error)
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getCar
}