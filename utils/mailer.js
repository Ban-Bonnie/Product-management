const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "thomasakalam@gmail.com",
        pass: "pxoknotzmyozwkly" 
    }
});

async function sendOTP(email, otp){
    try{
        await transporter.sendMail({
            from: "Secure System",
            to: email,
            subject: "OTP Verification",
            text: `Your verification code is: ${otp}`
        });

    }catch(error){
        console.error("Email sending error:",error);
        throw error;

    }

}
module.exports = { sendOTP };