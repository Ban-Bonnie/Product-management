const express = require("express");
const router = express.Router();
const db = require("../db");



/* Validator */
const validator = require("validator");
const security = require("../utils/security");
const auth = require("../middleware/auth");


/* LOGIN PAGE */

router.get("/login",(req,res)=>{
    res.render("user-login");
});

/* LOGIN */
router.post("/login",(req,res)=>{

    let email = req.body.email.trim();
    let password = req.body.password.trim();

    const sql = "SELECT * FROM users";

    db.execute(sql, async (err,users)=>{

        for(let user of users){

            let decryptedEmail = security.decrypt(user.email);

            if(decryptedEmail === email){

                const match = await security.comparePassword(password,user.password);

                if(match){

                    req.session.user = user;
                    return res.redirect("/user/dashboard");

                }

            }

        }

        res.send("Invalid login");

    });

});

/* REGISTER PAGE */
router.get("/register",(req,res)=>{
    res.render("register");
});

/* REGISTER USER */
router.post("/register", async (req,res)=>{

    let name = validator.escape(req.body.name.trim());
    let email = validator.normalizeEmail(req.body.email.trim());
    let password = req.body.password.trim();

    if(password.length < 8){
        return res.send("Password must be at least 8 characters");
    }

    if(!validator.isAlphanumeric(password)){
        return res.send("Password must be alphanumeric");
    }

    const hashedPassword = await security.hashPassword(password);

    const encryptedName = security.encrypt(name);
    const encryptedEmail = security.encrypt(email);

    const sql = "INSERT INTO users(name,email,password) VALUES(?,?,?)";

    db.execute(sql,[encryptedName,encryptedEmail,hashedPassword],(err)=>{

        if(err){
            res.send("Email already exists");
        }else{
            res.redirect("/user/login");
        }

    });

});

/* USER DASHBOARD */

router.get("/dashboard",(req,res)=>{

    db.execute("SELECT * FROM products",(err,products)=>{
        res.render("products",{products});
    });

});

/* PROFILE PAGE */

router.get("/profile",(req,res)=>{
    res.render("profile",{user:req.session.user});
});

/* UPDATE PROFILE */

router.post("/update-profile",(req,res)=>{

    let name = req.body.name.trim();
    let email = req.body.email.trim();

    const sql = "UPDATE users SET name=?, email=? WHERE id=?";

    db.execute(sql,[name,email,req.session.user.id],()=>{
        res.redirect("/user/profile");
    });

});

/* DELETE PROFILE */
router.get("/delete-profile",(req,res)=>{

    const sql = "DELETE FROM users WHERE id=?";

    db.execute(sql,[req.session.user.id],()=>{

        req.session.destroy();

        res.redirect("/user/register");

    });

});

module.exports = router;