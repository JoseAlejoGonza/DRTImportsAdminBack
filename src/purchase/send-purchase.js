const database = require("../database/database");
const dotenv = require("dotenv");
const purchaseConst = require("../const/const-purchases");

dotenv.config();

async function updatePurchase(pInfoToUpdate){
    const connection = await database.getConnection();
    let bodyResponse = {};
    let queryUpdateProduct =``;

    if(pInfoToUpdate.data.position_update === purchaseConst.PREPARED){
        queryUpdateProduct = `UPDATE purchase p SET p.is_being_prepared = true WHERE (p.id = ${pInfoToUpdate.data.pId});`;
    }
    if(pInfoToUpdate.data.position_update === purchaseConst.SEND){
        queryUpdateProduct = `UPDATE purchase p SET p.it_was_sent = true WHERE (p.id = ${pInfoToUpdate.data.pId});`;
    }
    if(pInfoToUpdate.data.position_update === purchaseConst.DELIVERED){
        queryUpdateProduct = `UPDATE purchase p SET p.is_delivered = true WHERE (p.id = ${pInfoToUpdate.data.pId});`;
    }
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