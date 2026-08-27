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
            .populate('uploadedBy', '_id fullName profilePicture')
            .populate('comments')

        const total = await MemoryModel.countDocuments(filter)

        res.status(200).json({ success: true, memories, total, page: Number(page), limit: Number(limit) })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch memories' })
    }
}

const updateMemory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const { title, description, tags, location } = req.body
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid memory id' })
        return
    }

    try {
        const memory = await MemoryModel.findById(id)

        if (!memory) {
            res.status(404).json({ success: false, message: 'Memory not found' })
            return
        }

        if (!memory.uploadedBy.equals(userId)) {
            res.status(403).json({ success: false, message: 'Not authorized to update this memory' })
            return
        }

        const updated = await MemoryModel.findByIdAndUpdate(
            id,
            { title, description, tags, location },
            { new: true }
        )

        res.status(200).json({ success: true, memory: updated })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to update memory' })
    }
}

const deleteMemory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid memory id' })
        return
    }

    try {
        const memory = await MemoryModel.findById(id)

        if (!memory) {
            res.status(404).json({ success: false, message: 'Memory not found' })
            return
        }

        if (!memory.uploadedBy.equals(userId)) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this memory' })
            return
        }

        await MemoryModel.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: 'Memory deleted successfully' })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to delete memory' })
    }
}

const toggleLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid memory id' })
        return
    }

    try {
        const memory = await MemoryModel.findById(id)

        if (!memory) {
            res.status(404).json({ success: false, message: 'Memory not found' })
            return
        }

        const hasLiked = memory.likes?.some((likeId) => likeId.equals(userId as any))

        if (hasLiked) {
            await MemoryModel.findByIdAndUpdate(id, { $pull: { likes: userId } })
        } else {
            await MemoryModel.findByIdAndUpdate(id, { $addToSet: { likes: userId } })
        }

        const updated = await MemoryModel.findById(id).populate('uploadedBy', '_id fullName profilePicture')

        res.status(200).json({ success: true, memory: updated, liked: !hasLiked })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to toggle like' })
    }
}

export default {
    createMemory,
    getMemories,
    updateMemory,
    deleteMemory,
    toggleLike
}
