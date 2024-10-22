const database = require("../database/database");
const dotenv = require("dotenv");

dotenv.config();

async function updatePurchase(pInfoToUpdate){
    const connection = await database.getConnection();
    let bodyResponse = {};

    let queryUpdateProduct = `UPDATE purchase p SET p.it_was_sent = true WHERE (p.id = ${pInfoToUpdate.data.pId});`;
    const [rowsUpdateProduct, fieldsAdd] = await connection.query(queryUpdateProduct);
    if(rowsUpdateProduct && rowsUpdateProduct.affectedRows == 1){
        bodyResponse.messageRes='update_successful';
    }else{
        bodyResponse.messageRes = 'update_failed';
    }
    return bodyResponse;
};

module.exports = {
    updatePurchase
}