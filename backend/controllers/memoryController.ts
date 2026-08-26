import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { MemoryModel } from '../models/memory.model.js'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
        familyId?: string | mongoose.Types.ObjectId
    }
}

const createMemory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, type, mediaUrl, thumbnailUrl, tags, location } = req.body
    const userId = req.user?._id
    const familyId = req.user?.familyId

    if (!userId || !familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const memory = await MemoryModel.create({
            title,
            description,
            type,
            mediaUrl,
            thumbnailUrl,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId,
            uploadedBy: userId,
            tags,
            location
        })

        res.status(201).json({ success: true, memory })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to create memory' })
    }
}

const getMemories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id
    const familyId = req.user?.familyId

    if (!userId || !familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const { type, page = 1, limit = 20, search = '' } = req.query
        const filter: any = { familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId }
        if (type) filter.type = type

        if (search) {
            const searchRegex = new RegExp(search as string, 'i')
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ]
        }

        const memories = await MemoryModel.find(filter)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('uploadedBy', 'fullName')

        const total = await MemoryModel.countDocuments(filter)

        res.status(200).json({ success: true, memories, total, page: Number(page), limit: Number(limit) })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch memories' })
    }
}

export default {
    createMemory,
    getMemories
}
