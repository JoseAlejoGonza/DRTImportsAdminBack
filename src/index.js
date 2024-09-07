const express = require("express");
const morgan = require("morgan");
const database = require("./database/database");
const login = require("./auth/login");
const response = require("./models/modelResponse");
const constLogin = require("./const/const-login");
const constCategroy = require("./const/const-category");
const category = require("./add-items/add-category");
const product = require("./add-items/add-products");
const constProduct = require("./const/const-product");
const cors = require("cors");

// Initial configuration
const app = express();
app.set("port",4000);
app.listen(app.get("port"));

// Middlewares
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost']
}));
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/products", async (req, res)=>{
    const connection = await database.getConnection();
    let query = `SELECT p.id AS product_id, p.name AS product_name, p.description AS product_description, p.total_quantity, p.bar_code, p.price_id, pp.price, pp.regular_price, pp.discount, sc.sub_category_name, GROUP_CONCAT(img.image_url) AS images, GROUP_CONCAT(img.id) AS imagesId FROM product p JOIN product_price pp ON p.price_id = pp.id JOIN sub_category sc ON p.sub_category_id = sc.id LEFT JOIN imagedetails img ON p.id = img.product_id GROUP BY p.id;`;
    const [rows, fields] = await connection.query(query);
    res.json(rows);
});

app.get("/get-product-codebar/:codeBar", async (req, res)=>{
    const itemCodeBar = req.params.codeBar;
    const connection = await database.getConnection();
    const query = `SELECT p.id, p.name, p.description, p.created_at, p.slug, p.sub_category_id, p.total_quantity FROM product p WHERE p.bar_code = ${itemCodeBar} AND name IS NOT NULL AND name <> '';`;
    const [rows, fields] = await connection.query(query);
    if(rows.length === 0){
        res.sendStatus(404);
    }else{
        res.json(rows[0]);
    }
});

app.post("/login", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let islogin =  await login.validatelogin(req.body);
        switch (islogin) {
            case constLogin.SUCCES:
                res.json(response.responseStructure(200,"",constLogin.SUCCES));
                break;
            case constLogin.BADUSR:
                res.json(response.responseStructure(416,"",constLogin.BADUSR));
                break;
            case constLogin.BADPASS:
                res.json(response.responseStructure(418,"",constLogin.BADPASS));
                break;
            default:
                res.json(response.responseStructure(404,"",constLogin.BADLOGIN));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});

app.get("/users-admin", async (req, res)=>{
    const connection = await database.getConnection();
    const [rows, fields] = await connection.query("SELECT ua.name, ua.email, ua.alias FROM user_admin ua WHERE ua.name IS NOT NULL AND name <> ''");
    res.json(rows);
});

app.get("/list-category", async (req, res)=>{
    const connection = await database.getConnection();
    const [rows, fields] = await connection.query("SELECT c.id,c.category_name FROM category c WHERE c.category_name IS NOT NULL AND c.category_name <> ''");
    res.json(rows);
});

app.get("/list-subcategory/:idCategory", async (req, res)=>{
    const itemId = req.params.idCategory;
    const connection = await database.getConnection();
    const query = `SELECT sc.id, sc.sub_category_name FROM sub_category sc JOIN category c ON sc.category_id = c.id WHERE sc.category_id = ${itemId} AND sub_category_name IS NOT NULL AND sub_category_name <> ''`
    const [rows, fields] = await connection.query(query);
    res.json(rows);
});

app.post("/new-category", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let isInsertCategory =  await category.createCategory(req.body);
        switch (isInsertCategory.messageRes) {
            case constCategroy.INSERT_SUCCESFUL:
                res.json(response.responseStructure(200,"",isInsertCategory));
                break;
            case constCategroy.CATEGORY_EXIST:
                res.json(response.responseStructure(416,"",isInsertCategory));
                break;
            case constCategroy.INSERT_FAILED:
                res.json(response.responseStructure(418,"",isInsertCategory));
                break;
            default:
                res.json(response.responseStructure(404,"",isInsertCategory));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});

app.post("/new-subcategory", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let isInsertSubcategory =  await category.createSubcategory(req.body);
        switch (isInsertSubcategory.messageRes) {
            case constCategroy.INSERT_SUCCESFUL:
                res.json(response.responseStructure(200,"",isInsertSubcategory));
                break;
            case constCategroy.SUBCATEGORY_EXIST:
                res.json(response.responseStructure(416,"",isInsertSubcategory));
                break;
            case constCategroy.INSERT_FAILED:
                res.json(response.responseStructure(418,"",isInsertSubcategory));
                break;
            default:
                res.json(response.responseStructure(404,"",isInsertSubcategory));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});

app.post("/new-product", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let isInsertProduct = await product.createPrice(req.body);
        switch (isInsertProduct.messageRes) {
            case constProduct.INSERT_SUCCESFUL:
                res.json(response.responseStructure(200,"",isInsertProduct));
                break;
            case constProduct.PRODUCT_EXIST:
                res.json(response.responseStructure(416,"",isInsertProduct));
                break;
            case constProduct.INSERT_FAILED:
                res.json(response.responseStructure(418,"",isInsertProduct));
                break;
            default:
                res.json(response.responseStructure(404,"",isInsertProduct));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});

app.put("/edit-product", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let isUpdateProduct =  await product.updateProduct(req.body);
        switch (isUpdateProduct.messageRes) {
            case constProduct.UPDATE_SUCCESFUL:
                res.json(response.responseStructure(200,"",isUpdateProduct));
                break;
            case constProduct.UPDATE_FAILED:
                res.json(response.responseStructure(418,"",isUpdateProduct));
                break;
            default:
                res.json(response.responseStructure(404,"",isUpdateProduct));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});