module.exports = {

checkAdmin: function(req,res,next){

    if(req.session && req.session.admin){
        next();
    } else {
        res.redirect("/admin/login");
    }

},

checkUser: function(req,res,next){

    if(req.session && req.session.user){
        next();
    } else {
        res.redirect("/user/login");
    }

}

};