const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

const app = express();

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret:"secretkey",
    resave:false,
    saveUninitialized:true
}));

app.use("/admin",adminRoutes);
app.use("/user",userRoutes);

app.get("/",(req,res)=>{
    res.send("System Running");
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});