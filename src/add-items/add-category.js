const database = require("../database/database");
const dotenv = require("dotenv");

dotenv.config();

async function createCategory(name){
    const connection = await database.getConnection();
    let bodyResponse = {};
    let search = await searchCategory(name.data.categoryName)

    if(search && search.length > 0){
        bodyResponse.messageRes='category_already_exists';
    }else{
        let queryAdd = `INSERT INTO category (category_name) VALUES ('${name.data.categoryName}');`
        const [rowsAdd, fieldsAdd] = await connection.query(queryAdd);
        if(rowsAdd && rowsAdd.affectedRows == 1){
            let searchNewCategory = await searchCategory(name.data.categoryName);
            console.log(searchNewCategory, 'esta es la segunda llamada del search');
            bodyResponse.messageRes='insert_successful';
            bodyResponse.id_category=searchNewCategory[0].id;
        }else{
            bodyResponse.messageRes = 'insert_failed';
        }
    }
    return bodyResponse;
};

async function searchCategory(name){
    const connection = await database.getConnection();
    let query = `SELECT c.id, c.category_name FROM category c WHERE c.category_name = '${name}';`;
    const [rows, fields] = await connection.query(query);
    return rows;
}

async function createSubcategory(body){
    console.log(body, 'esto es body dentro de create subcategory');
    const connection = await database.getConnection();
    let bodyResponse = {};
    let search = await searchSubcategory(body);

    if(search && search.length > 0){
        bodyResponse.messageRes='subcategory_already_exists';
    }else{
        let queryAdd = `INSERT INTO sub_category (sub_category_name, category_id) VALUES ('${body.data.subcategoryName}', ${body.data.categoryId});`
        const [rowsAdd, fieldsAdd] = await connection.query(queryAdd);
        if(rowsAdd && rowsAdd.affectedRows == 1){
            let searchNewSubategory = await searchSubcategory(body);
            console.log(searchNewSubategory, 'esta es la segunda llamada del search');
            bodyResponse.messageRes='insert_successful';
            bodyResponse.categoryInfo=searchNewSubategory[0];
        }else{
            bodyResponse.messageRes = 'insert_failed';
        }
    }
    return bodyResponse;
};

async function searchSubcategory(body){
    const connection = await database.getConnection();
    let query = `SELECT sc.id, sc.sub_category_name, sc.category_id, c.category_name FROM sub_category sc JOIN category c ON sc.category_id = c.id WHERE sc.category_id = ${body.data.categoryId} AND sc.sub_category_name = '${body.data.subcategoryName}' AND sub_category_name IS NOT NULL AND sub_category_name <> '';`;
    const [rows, fields] = await connection.query(query);
    return rows;
}

module.exports = {
    createCategory,
    createSubcategory
}