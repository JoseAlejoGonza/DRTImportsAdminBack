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

async function updateProduct(pInfoToUpdate){
    const connection = await database.getConnection();
    let bodyResponse = {};

    let queryUpdateProduct = `UPDATE product SET name = '${pInfoToUpdate.data.pName}', description = '${pInfoToUpdate.data.pDesc}', total_quantity = ${pInfoToUpdate.data.pQantity} WHERE (id = ${pInfoToUpdate.data.pId});`;
    const [rowsUpdateProduct, fieldsAdd] = await connection.query(queryUpdateProduct);
    if(rowsUpdateProduct && rowsUpdateProduct.affectedRows == 1){
        let realPrice = pInfoToUpdate.data.pPrice - ((pInfoToUpdate.data.pPrice*pInfoToUpdate.data.pPercent)/100);
        let queryUpdatePrice = `UPDATE product_price SET price = ${realPrice}, regular_price = ${pInfoToUpdate.data.pPrice}, discount = ${pInfoToUpdate.data.pPercent} WHERE (id = ${pInfoToUpdate.data.pPriceId});`;
        const [rowsUpdatePrice, fieldsAdd] = await connection.query(queryUpdatePrice);
        if(rowsUpdatePrice && rowsUpdatePrice.affectedRows == 1){
            for(let i = 0; i < pInfoToUpdate.data.imgUrls.length; i++){
                let queryUpdateUrls = `UPDATE imagedetails SET image_url = '${pInfoToUpdate.data.imgUrls[i]}' WHERE (id = ${pInfoToUpdate.data.imgIds[i]});`;
                const [rowsUpdateUrls, fieldsAdd] = await connection.query(queryUpdateUrls);
                if(rowsUpdateUrls && rowsUpdateUrls.affectedRows == 1 && i == pInfoToUpdate.data.imgUrls.length-1){
                    bodyResponse.messageRes='update_successful';
                }
            }
        }
    }else{
        bodyResponse.messageRes = 'update_failed';
    }
    return bodyResponse;
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
    createPrice,
    updateProduct
}