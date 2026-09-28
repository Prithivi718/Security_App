import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    }
});

export const sendOtpEmail = async (emailId, otp) => {

    await transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: emailId,
        subject: "Verify your email",
        text: `Your OTP is ${otp}`
    });

};