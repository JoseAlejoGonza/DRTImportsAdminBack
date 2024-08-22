const express = require("express");
const morgan = require("morgan");
const database = require("./database/database");
const login = require("./auth/login");
const response = require("./models/modelResponse");
const constLogin = require("./const/const-login");
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
})