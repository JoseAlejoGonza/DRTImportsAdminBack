const database = require("../database/database");
const dotenv = require("dotenv");

dotenv.config();

async function createPrice(productInfo){
    const connection = await database.getConnection();
    let bodyResponse = {};
    let search = await searchProduct(productInfo.data.pName);

    if(search && search.length > 0){
        bodyResponse.messageRes='product_already_exists';
    }else{
        let realPrice = productInfo.data.pPrice - ((productInfo.data.pPrice*productInfo.data.pPercent)/100);
        let queryAddPrice = `INSERT INTO product_price (price, regular_price, shipping_price, discount) VALUES (${realPrice}, ${productInfo.data.pPrice}, 0, ${productInfo.data.pPercent});`;
        const [rowsAddPrice, fieldsAdd] = await connection.query(queryAddPrice);
        if(rowsAddPrice && rowsAddPrice.affectedRows == 1){
            let insertProduct = await createProduct(productInfo, rowsAddPrice.insertId);
            bodyResponse.messageRes=insertProduct;
        }else{
            bodyResponse.messageRes = 'insert_failed';
        }
    }
    return bodyResponse;
};

async function createProduct(productInfo, priceId){
    const connection = await database.getConnection();
    let response = '';
    let date = new Date();
    let queryAddProduct = `INSERT INTO product 
        (name, description, slug, sub_category_id, total_quantity, bar_code, price_id, admin_id) 
        VALUES ('${productInfo.data.pName}', '${productInfo.data.pDesc}', '${productInfo.data.pSlug}', ${productInfo.data.pCategoryInfo.id}, ${productInfo.data.pQantity}, ${productInfo.data.pCodeBar}, ${priceId}, 1);`;
    const [rowsAddProduct, fieldsAdd] = await connection.query(queryAddProduct);
    if(rowsAddProduct && rowsAddProduct.affectedRows == 1){
        let urlsInfo = {
            principalImage: productInfo.data.pPrincipalImage,
            othersUrls: productInfo.data.pOtherUrls
        };
        let insertUrls = await createUrls(urlsInfo, rowsAddProduct.insertId);
        response=insertUrls;
    }else{
        response = 'insert_failed';
    }
    return response;
};

async function createUrls(urlInfo, productId){
    const connection = await database.getConnection();
    let response = '';
    let queryAddImage = `INSERT INTO imagedetails (product_id, image_url) VALUES (${productId}, '${urlInfo.principalImage}');`;
    const [rowsAddImage, fieldsAdd] = await connection.query(queryAddImage);
    if(rowsAddImage && rowsAddImage.affectedRows == 1){
        for(let i = 0; i<urlInfo.othersUrls.length; i++){
            let queryAddImages = `INSERT INTO imagedetails (product_id, image_url) VALUES (${productId}, '${urlInfo.othersUrls[i]}');`;
            const [rowsAddImages, fieldsAdd] = await connection.query(queryAddImages);
            if(rowsAddImages && rowsAddImages.affectedRows == 1){
                response='insert_successful';
            }
        }
    }else{
        response = 'insert_failed';
    }
    return response;
};

async function searchProduct(name){
    const connection = await database.getConnection();
    let query = `SELECT p.id FROM product p WHERE p.name = '${name}';`;
    const [rows, fields] = await connection.query(query);
    return rows;
}

module.exports = {
    createPrice
}