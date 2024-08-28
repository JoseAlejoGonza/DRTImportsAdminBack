const database = require("../database/database");
const dotenv = require("dotenv");

dotenv.config();

async function createCategory(name){
    console.log(name, "esto es dentro de createCategory")
    const connection = await database.getConnection();
    let query = `SELECT c.category_name FROM category c WHERE c.category_name = '${name.name}';`;
    const [rows, fields] = await connection.query(query);
    if(rows && rows.length > 0){
        console.log(rows, "estoy dentro del if");
        isCorrect = 'category_already_exists';
    }else{
        let queryAdd = `INSERT INTO category (category_name) VALUES ('${name.name}');`
        const [rowsAdd, fieldsAdd] = await connection.query(queryAdd);
        console.log(rowsAdd, 'rows added')
        if(rowsAdd && rowsAdd.affectedRows == 1){
            console.log(rowsAdd, "estoy dentro del if al agregar");
            isCorrect = 'insert_successful';
        }else{
            isCorrect = 'insert_failed';
        }
    }
    return isCorrect;
};

module.exports = {
    createCategory
}