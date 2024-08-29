const express = require("express");
const morgan = require("morgan");
const database = require("./database/database");
const login = require("./auth/login");
const response = require("./models/modelResponse");
const constLogin = require("./const/const-login");
const constCategroy = require("./const/const-category");
const category = require("./add-items/add-category");
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
    const [rows, fields] = await connection.query("SELECT p.id, p.name, p.description, p.created_at, p.slug, p.sub_category_id, p.total_quantity, c.sub_category_name FROM product p JOIN sub_category c ON p.sub_category_id = c.id WHERE name IS NOT NULL AND name <> ''");
    for(let i =0; i< rows.length; i++){
        let imageUrlArray = [];
        const query = `SELECT image_url FROM imagedetails where product_id = ${rows[i].id}`;
        const [rowsImages, fieldsImages] = await connection.query(query);

        for(let img = 0; img< rowsImages.length; img++){
            imageUrlArray.push(rowsImages[img].image_url);
        }

        rows[i].imageUrl = imageUrlArray;
    }
    res.json(rows);
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
        switch (isInsertCategory) {
            case constCategroy.INSERT_SUCCESFUL:
                res.json(response.responseStructure(200,"",constCategroy.INSERT_SUCCESFUL));
                break;
            case constCategroy.CATEGORY_EXIST:
                res.json(response.responseStructure(416,"",constCategroy.CATEGORY_EXIST));
                break;
            case constCategroy.INSERT_FAILED:
                res.json(response.responseStructure(418,"",constCategroy.INSERT_FAILED));
                break;
            default:
                res.json(response.responseStructure(404,"",constCategroy.ERROR));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});

app.post("/new-subcategory", async (req, res)=>{
    if(req.body && Object.keys(req.body).length > 0){
        let isInsertSubcategory =  await category.createSubcategory(req.body);
        switch (isInsertSubcategory.message) {
            case constCategroy.INSERT_SUCCESFUL:
                let responseToBody={
                    messageRes: isInsertSubcategory.message,
                    id_caegory: isInsertSubcategory.category_id
                };
                res.json(response.responseStructure(200,"",responseToBody));
                break;
            case constCategroy.CATEGORY_EXIST:
                res.json(response.responseStructure(416,"",constCategroy.CATEGORY_EXIST));
                break;
            case constCategroy.INSERT_FAILED:
                res.json(response.responseStructure(418,"",constCategroy.INSERT_FAILED));
                break;
            default:
                res.json(response.responseStructure(404,"",constCategroy.ERROR));
                break;
        }
    }else{
        res.sendStatus(400);
    }
});