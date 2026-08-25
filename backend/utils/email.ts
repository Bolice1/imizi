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
})

const sendWelcomeEmail = async (fullName: string, loginUrl: string, email: string): Promise<void> => {
    try {
        const options = {
            from: `Imizi<${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Imizi',
            html: emailTemplates.welcomeEmailTemplate(fullName, loginUrl)
        }
        const info = await transporter.sendMail(options)
        console.log(`Welcome email sent: ${info.response}`)
    } catch (error) {
        console.log(`Error sending Welcome email: ${(error as Error).message}`)
    }
}

const sendResetPasswordEmail = async (fullName: string, email: string, resetUrl: string): Promise<void> => {
    const options = {
        from: `Imizi<${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Request for a password reset',
        html: emailTemplates.resetPasswordEmailTemplate(fullName, resetUrl)
    }

    try {
        const info = await transporter.sendMail(options)
        console.log(`Password reset email sent ${info.response}`)
    } catch (error) {
        console.log(`Error sending password reset email ${(error as Error).message}`)
    }
}

const sendFamilyInvitationEmail = async (inviterName: string, familyName: string, inviteUrl: string, email: string): Promise<void> => {
    const options = {
        from: `Imizi<${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You are invited to join ${familyName} on Imizi`,
        html: emailTemplates.familyInvitationEmailTemplate(inviterName, familyName, inviteUrl)
    }

    try {
        const info = await transporter.sendMail(options)
        console.log(`Family invitation email sent ${info.response}`)
    } catch (error) {
        console.log(`Error sending family invitation email ${(error as Error).message}`)
    }
}

export default {
    sendWelcomeEmail,
    sendResetPasswordEmail,
    sendFamilyInvitationEmail
}
