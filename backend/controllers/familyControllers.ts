import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { FamilyModel } from '../models/family.model.js'
import { InvitationModel } from '../models/invitation.model.js'
import { UserModel } from '../models/user.model.js'
import emailUtils from '../utils/email.js'
import crypto from 'crypto'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
    }
}

const createFamily = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { familyName } = req.body
    const userId = req.user?._id

    if (!familyName || !userId) {
        res.status(400).json({ success: false, message: 'familyName is required' })
        return
    }

    try {
        const family = await FamilyModel.create({
            familyName,
            createdBy: userId,
            familyMembers: [userId]
        })

        await UserModel.findByIdAndUpdate(userId, { familyId: family._id, role: 'admin_family' })

        res.status(201).json({ success: true, message: 'Family created', family })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to create family' })
    }
}

const inviteMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { email, familyId } = req.body
    const inviter = req.user

    if (!email || !familyId || !inviter) {
        res.status(400).json({ success: false, message: 'email and familyId are required' })
        return
    }

    try {
        const family = await FamilyModel.findById(familyId)
        if (!family) {
            res.status(404).json({ success: false, message: 'Family not found' })
            return
        }

        if (!family.createdBy.equals(inviter._id)) {
            res.status(403).json({ success: false, message: 'Only family admin can invite members' })
            return
        }

        const invitedUser = await UserModel.findOne({ email })
        if (invitedUser && family.familyMembers && family.familyMembers.includes(invitedUser._id)) {
            res.status(400).json({ success: false, message: 'User is already a member of this family' })
            return
        }

        const code = crypto.randomBytes(32).toString('hex').toUpperCase()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const invitation = await InvitationModel.create({
            email,
            familyId,
            code,
            expiresAt,
            invitedBy: inviter._id
        })

        const host = req.get('host')
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
        const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`
        const inviteUrl = `${frontendUrl}/invite/${code}`

        emailUtils.sendFamilyInvitationEmail(inviter.fullName, family.familyName, inviteUrl, email).then(() => {
            console.log('Invitation email sent')
        })

        res.status(201).json({ success: true, message: 'Invitation sent', invitation })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to send invitation' })
    }
}

const joinFamily = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { code } = req.body
    const userId = req.user?._id

    if (!code || !userId) {
        res.status(400).json({ success: false, message: 'code is required' })
        return
    }

    try {
        const invitation = await InvitationModel.findOne({ code: code.toUpperCase() })
        if (!invitation) {
            res.status(404).json({ success: false, message: 'Invalid invitation code' })
            return
        }

        if (invitation.status !== 'pending') {
            res.status(400).json({ success: false, message: 'Invitation already used' })
            return
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired'
            await invitation.save()
            res.status(400).json({ success: false, message: 'Invitation expired' })
            return
        }

        const family = await FamilyModel.findById(invitation.familyId)
        if (!family) {
            res.status(404).json({ success: false, message: 'Family not found' })
            return
        }

        const user = await UserModel.findById(userId)
        if (!user) {
            res.status(404).json({ success: false, message: 'invalid credentials' })
            return
        }

        const members = family.familyMembers || []
        if (!members.some(member => member.equals(userId))) {
            members.push(new mongoose.Types.ObjectId(userId))
            family.familyMembers = members
            await family.save()
        }

        user.familyId = family._id
        user.role = 'user'
        await user.save()

        invitation.status = 'accepted'
        await invitation.save()

        res.status(200).json({ success: true, message: 'Joined family successfully', family })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to join family' })
    }
}

const getMyFamily = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const user = await UserModel.findById(userId)
        if (!user?.familyId) {
            res.status(200).json({ success: true, family: null })
            return
        }

        const family = await FamilyModel.findById(user.familyId).populate('familyMembers', 'fullName email')
        if (!family) {
            res.status(200).json({ success: true, family: null })
            return
        }

        res.status(200).json({ success: true, family })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch family' })
    }
}

const getFamilyTree = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const user = await UserModel.findById(userId)
        if (!user?.familyId) {
            res.status(404).json({ success: false, message: 'No family found' })
            return
        }

        const family = await FamilyModel.findById(user.familyId).populate('familyMembers', 'fullName email')
        if (!family) {
            res.status(404).json({ success: false, message: 'Family not found' })
            return
        }

        const members = family.familyMembers || []
        const generations: any = {
            elders: [],
            theirChildren: [],
            yourGeneration: [],
            theLittleOnes: []
        }

        if (members.length > 0) {
            const admin = members.find((m: any) => m._id.toString() === user.familyId?.toString())
            generations.elders = members.filter((m: any) => {
                const age = Math.floor(Math.random() * 30) + 60
                return age >= 60
            }).slice(0, 2)
            
            generations.theirChildren = members.filter((m: any) => {
                const age = Math.floor(Math.random() * 20) + 40
                return age >= 40 && age < 60
            }).slice(0, 4)
            
            generations.yourGeneration = members.filter((m: any) => {
                const age = Math.floor(Math.random() * 20) + 20
                return age >= 20 && age < 40
            }).slice(0, 3)
            
            generations.theLittleOnes = members.filter((m: any) => {
                const age = Math.floor(Math.random() * 15) + 5
                return age < 20
            }).slice(0, 2)
        }

        res.status(200).json({ 
            success: true, 
            family,
            treeData: family.treeData || generations,
            generations 
        })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch family tree' })
    }
}

const generateInviteLink = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const user = await UserModel.findById(userId)
        if (!user?.familyId) {
            res.status(404).json({ success: false, message: 'No family found' })
            return
        }

        const family = await FamilyModel.findById(user.familyId)
        if (!family || !family.createdBy.equals(userId)) {
            res.status(403).json({ success: false, message: 'Only family admin can generate invite links' })
            return
        }

        const code = crypto.randomBytes(4).toString('hex').toUpperCase()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const invitation = await InvitationModel.create({
            email: '',
            familyId: user.familyId,
            code,
            expiresAt,
            invitedBy: userId
        })

        res.status(200).json({ success: true, code, expiresAt })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to generate invite code' })
    }
}

const getInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = typeof req.params.code === 'string' ? req.params.code : ''

    if (!code) {
        res.status(400).json({ success: false, message: 'Code is required' })
        return
    }

    try {
        const invitation = await InvitationModel.findOne({ code: code.toUpperCase() }).populate('familyId', 'familyName')
        if (!invitation) {
            res.status(404).json({ success: false, message: 'Invalid invitation code' })
            return
        }

        if (invitation.status !== 'pending') {
            res.status(400).json({ success: false, message: 'Invitation already used' })
            return
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired'
            await invitation.save()
            res.status(400).json({ success: false, message: 'Invitation expired' })
            return
        }

        res.status(200).json({ success: true, invitation })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch invitation' })
    }
}

export default {
    createFamily,
    inviteMember,
    joinFamily,
    getMyFamily,
    getInvite,
    generateInviteLink,
    getFamilyTree
}
