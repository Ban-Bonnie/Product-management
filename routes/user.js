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

router.get("/dashboard", auth.checkUser,(req,res)=>{

    db.execute("SELECT * FROM products",(err,products)=>{
        res.render("products",{products});
    });

});
/* LOGOUT */
router.get("/logout",(req,res)=>{

    req.session.destroy((err)=>{
        if(err){
            return res.send("Error logging out");
        }

        res.redirect("/user/login");
    });

});

/* PROFILE PAGE */

router.get("/profile", auth.checkUser,(req,res)=>{

    const user = req.session.user;

    const decryptedUser = {
        id: user.id,
        name: security.decrypt(user.name),
        email: security.decrypt(user.email)
    };

    res.render("profile",{user: decryptedUser});

});

/* UPDATE PROFILE */
router.post("/update-profile",auth.checkUser, async (req,res)=>{

    let name = req.body.name.trim();
    let email = req.body.email.trim();
    let password = req.body.password.trim();

    const user = req.session.user;

    const match = await security.comparePassword(password,user.password);

    if(!match){
        return res.send("<script>alert('Wrong password'); window.location='/user/profile'</script>");
    }

    const encryptedName = security.encrypt(name);
    const encryptedEmail = security.encrypt(email);

    const sql = "UPDATE users SET name=?, email=? WHERE id=?";

    db.execute(sql,[encryptedName,encryptedEmail,user.id],()=>{

        req.session.user.name = encryptedName;
        req.session.user.email = encryptedEmail;

        res.redirect("/user/profile");

    });

});

/* DELETE PROFILE */
router.get("/delete-profile",auth.checkUser,(req,res)=>{

    const sql = "DELETE FROM users WHERE id=?";

    db.execute(sql,[req.session.user.id],()=>{

        req.session.destroy();

        res.redirect("/user/register");

    });

});

module.exports = router;