const pool = require('../database/index');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rowCount;
    } catch (error) {
        return error.message;
    }
}

/* **********************
 *   Check for login attempt
 * ********************* */
async function checkValidAccount(account_email, account_password) {
    try {
        console.log(account_email);
        console.log(account_password);
        const sql = "SELECT * FROM account WHERE account_email = $1 AND account_password = $2";
        return await pool.query(sql, [account_email, account_password]);
    } catch (error) {
        return error.message;
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

/* *****************************
* Return account data using account id
* ***************************** */
async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
            [account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

async function updateAccountContent(account_firstname, account_lastname, account_email, account_id){
    try {
        console.log('update account content executes')
        const sql = `UPDATE public.account 
        SET
        account_firstname = $1, 
        account_lastname = $2, 
        account_email = $3
        WHERE account_id = $4 
        RETURNING *`
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    } catch (error) {
        return error.message
    }
}

async function updateAccountPassword(account_password, account_id){
    try {
        console.log('update account password executes')
        const sql = `UPDATE public.account 
        SET
        account_password = $1
        WHERE account_id = $2
        RETURNING *`
        return await pool.query(sql, [account_password, account_id])
    } catch (error) {
        return error.message
    }
}

/* *************************
 * Model for the final project
 * Collects all the account
 * ********************** */
async function getAccounts() {
    return await pool.query("SELECT * FROM public.account ORDER BY account_id");
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    checkValidAccount,
    getAccountByEmail,
    getAccountById,
    updateAccountContent,
    updateAccountPassword,
    getAccounts
}