import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import emailUtils from '../utils/email.js'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

dotenv.config()

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fullName, email, password, invitationCode } = req.body
    if (!fullName || !email || !password) {
        res.status(400).json({
            success: false,
            message: 'fullName, email and password are all required'
        })
        return
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await UserModel.create({
            fullName,
            email,
            password: hashedPassword,
            invitationCode: invitationCode || undefined
        })
        const host = req.get('host')
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
        const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`
        const loginUrl = `${frontendUrl}/login`

        const token = jwt.sign(
            { user: { _id: newUser._id } },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

        const userToReturn = await UserModel.findById(newUser._id).select('-password')

        emailUtils.sendWelcomeEmail(fullName, loginUrl, email).then(() => {
            console.log('Welcome email sent')
        })

        res.status(201).json({
            success: true,
            message: 'User registered',
            token,
            user: userToReturn
        })
    } catch (error) {
        console.log((error as Error).message)
        next(error)
    }
}

const logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({
            success: false,
            message: 'email and password are all required'
        })
        return
    }

    try {
        const user = await UserModel.findOne({ email }).select('+password')
        const userToReturn = await UserModel.findOne({ email }).select('-password')
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found'
            })
            return
        }

        if (!await bcrypt.compare(password, user.password)) {
            res.status(400).json({
                success: false,
                message: 'Incorrect password'
            })
            return
        }

        const token = jwt.sign(
            { user: { _id: user._id } },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userToReturn
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error'
        })
        console.log((error as Error).message)
    }
}

const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const user = await UserModel.findById(userId).select('-password')
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' })
            return
        }

        res.status(200).json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' })
        console.log((error as Error).message)
    }
}

const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?._id
    const { fullName, email } = req.body

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const updated = await UserModel.findByIdAndUpdate(
            userId,
            { fullName, email },
            { new: true }
        ).select('-password')

        if (!updated) {
            res.status(404).json({ success: false, message: 'User not found' })
            return
        }

        res.status(200).json({ success: true, user: updated })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' })
        console.log((error as Error).message)
    }
}

const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const email = req.body.email
    if (!email) {
        res.status(400).json({
            success: false,
            message: 'Email is required'
        })
        return
    }

    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found'
            })
            return
        }

        const resetToken = crypto.randomBytes(32).toString('hex')
        user.resetToken = resetToken
        user.resetTokenExpires = Date.now() + (30 * 60 * 1000)
        await user.save()

        const host = req.get('host')
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
        const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        emailUtils.sendResetPasswordEmail(user.fullName, email, resetUrl).then(() => {
            res.status(200).json({
                success: true,
                message: 'Reset Link has been sent to your email'
            })
        })

    } catch (error) {
        console.log((error as Error).message)
    }
}


const restPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resetToken = req.params.resetToken
    const email = req.query.email as string
    const newPassword = req.body.password
    if (!resetToken || !email) {
        res.status(400).json({
            success: false,
            message: 'No reset token in the reset link'
        })
        return
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Invalid reset link'
        })
        return
    }

    if(!user.resetToken){
        res.status(400).json({
            success:false,
            message:"Reset link expired"
        })
        return
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        if (!(resetToken === user.resetToken)) {
            res.status(400).json({
                success: false,
                message: "Tokens don't match"
            })
            return
        }

        if (!user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
            res.status(400).json({
                success: false,
                message: 'The resent link has expired'
            })
            return
        }

        user.password = newHashedPassword
        user.resetToken = undefined
        user.resetTokenExpires = undefined
        await user.save()

        res.status(200).json({
            success: true,
            message: 'Your password has been reset successfully'
        })

    } catch (error) {
        console.log((error as Error).message)
    }

}

const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' })
            return
        }

        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
        const host = req.get('host')
        const baseUrl = `${protocol}://${host}`
        const fileUrl = `${baseUrl}/uploads/${path.basename(req.file.filename)}`

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { profilePicture: fileUrl },
            { new: true }
        ).select('-password')

        res.status(200).json({ success: true, user: updatedUser, profilePicture: fileUrl })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload profile picture' })
        console.log((error as Error).message)
    }
}

export default {
    register,
    logIn,
    forgotPassword,
    restPassword,
    getProfile,
    updateProfile,
    uploadProfilePicture
}
