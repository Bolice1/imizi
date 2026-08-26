import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { UserModel } from '../models/user.model.js'
import { FamilyModel } from '../models/family.model.js'
import { InvitationModel } from '../models/invitation.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import emailUtils from '../utils/email.js'

dotenv.config()

const signToken = (userId: string): string =>
    jwt.sign(
        { user: { _id: userId } },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') } as jwt.SignOptions
    )

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
        const normalizedEmail = String(email).toLowerCase().trim()
        const existing = await UserModel.findOne({ email: normalizedEmail })
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'A user with this email already exists'
            })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await UserModel.create({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            invitationCode: invitationCode || undefined
        })

        const user = await UserModel.findById(newUser._id).select('-password')
        if (!user) {
            res.status(500).json({ success: false, message: 'Failed to create user' })
            return
        }

        // Best-effort: join a family if a valid invitation code was supplied.
        if (invitationCode) {
            try {
                const invitation = await InvitationModel.findOne({ code: String(invitationCode).toUpperCase() })
                if (invitation && invitation.status === 'pending' && invitation.expiresAt > new Date()) {
                    const family = await FamilyModel.findById(invitation.familyId)
                    if (family) {
                        const members = family.familyMembers || []
                        if (!members.some((m: any) => m.equals(newUser._id))) {
                            members.push(newUser._id)
                            family.familyMembers = members
                            await family.save()
                        }
                        user!.familyId = family._id
                        user!.role = 'user'
                        await user!.save()
                        invitation.status = 'accepted'
                        await invitation.save()
                    }
                }
            } catch (joinErr) {
                console.log('Auto-join failed (ignored):', (joinErr as Error).message)
            }
        }

        const token = signToken(user!._id.toString())
        const freshUser = await UserModel.findById(newUser._id).select('-password')

        res.status(201).json({
            success: true,
            message: 'User registered',
            token,
            user: freshUser
        })

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        emailUtils.sendWelcomeEmail(fullName, `${frontendUrl}/login`, normalizedEmail).catch(() => {})
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
        const normalizedEmail = String(email).toLowerCase().trim()
        const user = await UserModel.findOne({ email: normalizedEmail }).select('+password')
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'invalid credentials'
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

        const token = signToken(user._id.toString())
        const userToReturn = await UserModel.findById(user._id).select('-password')

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userToReturn
        })
    } catch (error) {
        console.log((error as Error).message)
        next(error)
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
        const user = await UserModel.findOne({ email: String(email).toLowerCase().trim() })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'invalid credentials'
            })
            return
        }

        const resetToken = crypto.randomBytes(32).toString('hex')
        user.resetToken = resetToken
        user.resetTokenExpires = Date.now() + (30 * 60 * 1000)
        await user.save()

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

        // Respond first, then attempt to send the email (non-blocking).
        res.status(200).json({
            success: true,
            message: 'Reset Link has been sent to your email'
        })
        emailUtils.sendResetPasswordEmail(user.fullName, email, resetUrl).catch(() => {})
    } catch (error) {
        console.log((error as Error).message)
        next(error)
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

    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid reset link'
            })
            return
        }

        if (!user.resetToken) {
            res.status(400).json({
                success: false,
                message: 'Reset link expired'
            })
            return
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10)

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
                message: 'The reset link has expired'
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
        next(error)
    }
}


export default {
    register,
    logIn,
    forgotPassword,
    restPassword
}
