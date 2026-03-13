const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
const SECRET_KEY = "mysecretkey123";


/* HASH SA PASSW */

async function hashPassword(password){
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash){
    return await bcrypt.compare(password, hash);
}

/* AES FUCNTIONS */

function encrypt(text){
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(cipher){
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
    hashPassword,
    comparePassword,
    encrypt,
    decrypt
};

