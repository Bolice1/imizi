import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import emailTemplates from './emailTemplates.js'

dotenv.config()
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (fullName,loginUrl,email) => {
    try {
        const options = {
            from: `Imizi<${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Imizi",
            html:emailTemplates.welcomeEmailTemplate(fullName,loginUrl)
        }
        const info = await transporter.sendMail(options);
        console.log(`Welcome email sent: ${info.response}`)
    } catch (error) {
        console.log(`Error sending Welcome email: ${error}`)
    }
}

const sendResetPasswordEmail = async(fullName, email, resetUrl)=>{
    const options = {
        from: `Imizi<${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Request for a password reset",
        html:emailTemplates.resetPasswordEmailTemplate(fullName,resetUrl)
    }

    try {
        const info = await transporter.sendMail(options);
        console.log(`Password reset email sent ${info.response}`)
    } catch (error) {
        console.log(`Error sending password reset email ${error.message}`)
    }
}

export default {
    sendWelcomeEmail,
    sendResetPasswordEmail
}