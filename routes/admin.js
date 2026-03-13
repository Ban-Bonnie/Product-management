const express = require("express");
const router = express.Router();
const db = require("../db");
const validator = require("validator");
const security = require("../utils/security");
const auth = require("../middleware/auth");

/* ADMIN ROUTES */

router.get("/login",(req,res)=>{
    res.render("admin-login");
});

/* LOGIN */
router.post("/login",(req,res)=>{

    let email = req.body.email.trim();
    let password = req.body.password.trim();

    db.execute("SELECT * FROM users WHERE role='admin'", async (err,users)=>{

        for(let user of users){

            let decryptedEmail = security.decrypt(user.email);

            if(decryptedEmail === email){

                const match = await security.comparePassword(password,user.password);

                if(match){

                    req.session.admin = user;
                    return res.redirect("/admin/dashboard");

                }

            }

        }

        res.send("Invalid login");

    });

});

/* ADMIN LOGOUT */
router.get("/logout",(req,res)=>{

    delete req.session.admin;
    res.redirect("/admin/login");

});

/* DASHBOARD */
router.get("/dashboard",auth.checkAdmin,(req,res)=>{

    db.execute("SELECT * FROM users",(err,users)=>{

        const safeUsers = users.map(user => {

            return {
                id: user.id,
                name: validator.escape(security.decrypt(user.name)),
                email: validator.escape(security.decrypt(user.email))
            };

        });

        db.execute("SELECT * FROM products",(err,products)=>{

            res.render("admin-dashboard",{
                users: safeUsers,
                products: products
            });

        });

    });

});

/* UPDATE PRODUCT */
router.post("/update-product",(req,res)=>{

    let id = req.body.id;
    let name = req.body.name.trim();
    let price = req.body.price;
    let description = req.body.description.trim();

    const sql = "UPDATE products SET name=?, price=?, description=? WHERE id=?";

    db.execute(sql,[name,price,description,id],()=>{
        res.redirect("/admin/dashboard");
    });

});

/* CREATE PRODUCT */

router.post("/add-product",(req,res)=>{

    let name = req.body.name.trim();
    let price = req.body.price;
    let description = req.body.description.trim();

    const sql = "INSERT INTO products(name,price,description) VALUES(?,?,?)";

    db.execute(sql,[name,price,description],()=>{
        res.redirect("/admin/dashboard");
    });

});

/* DELETE PRODUCT */

router.get("/delete-product/:id",(req,res)=>{

    const sql = "DELETE FROM products WHERE id=?";

    db.execute(sql,[req.params.id],()=>{
        res.redirect("/admin/dashboard");
    });

});

module.exports = router;