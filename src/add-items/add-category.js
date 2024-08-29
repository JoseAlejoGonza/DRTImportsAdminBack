const database = require("../database/database");
const dotenv = require("dotenv");

dotenv.config();

async function createCategory(name){
    const connection = await database.getConnection();
    let isCorrect = '';
    let query = `SELECT c.category_name FROM category c WHERE c.category_name = '${name.data.categoryName}';`;
    const [rows, fields] = await connection.query(query);
    if(rows && rows.length > 0){
        isCorrect = 'category_already_exists';
    }else{
        let queryAdd = `INSERT INTO category (category_name) VALUES ('${name.data.categoryName}');`
        const [rowsAdd, fieldsAdd] = await connection.query(queryAdd);
        if(rowsAdd && rowsAdd.affectedRows == 1){
            isCorrect = 'insert_successful';
        }else{
            isCorrect = 'insert_failed';
        }
    }
    return isCorrect;
};

async function createSubcategory(body){
    console.log(body, "esto es dentro de subcreateCategory")
    const connection = await database.getConnection();
    let isCorrect = {};
    let query = `SELECT c.category_name FROM category c WHERE c.category_name = '${body.data.subcategoryName}';`;
    const [rows, fields] = await connection.query(query);
    if(rows && rows.length > 0){
        // console.log(rows, "estoy dentro del if");
        isCorrect.message = 'subcategory_already_exists';
    }else{
        let queryAdd = `INSERT INTO sub_category (sub_category_name, category_id) VALUES ('${body.data.subcategoryName}', ${body.data.category_id});`
        const [rowsAdd, fieldsAdd] = await connection.query(queryAdd);
        console.log(fieldsAdd, 'fieldsAdd added');
        if(rowsAdd && rowsAdd.affectedRows == 1){
            // console.log(rowsAdd, "estoy dentro del if al agregar");
            isCorrect = 'insert_successful';
        }else{
            isCorrect = 'insert_failed';
        }
    }
    return isCorrect;
};

module.exports = {
    createCategory,
    createSubcategory
}