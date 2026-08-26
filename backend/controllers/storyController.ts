import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { StoryModel } from '../models/story.model.js'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
        familyId?: string | mongoose.Types.ObjectId
    }
}

const createStory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, content, audioUrl, toldBy } = req.body
    const userId = req.user?._id
    const familyId = req.user?.familyId

    if (!userId || !familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const story = await StoryModel.create({
            title,
            content,
            audioUrl,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId,
            author: userId,
            toldBy: toldBy || req.user?.fullName
        })

        res.status(201).json({ success: true, story })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to create story' })
    }
}

const getStories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const familyId = req.user?.familyId

    if (!familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const stories = await StoryModel.find({ familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId }).sort({ createdAt: -1 }).populate('author', 'fullName')
        res.status(200).json({ success: true, stories })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch stories' })
    }
}

const getStoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const story = await StoryModel.findById(req.params.id).populate('author', 'fullName email')
        if (!story) {
            res.status(404).json({ success: false, message: 'Story not found' })
            return
        }
        res.status(200).json({ success: true, story })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch story' })
    }
}

export default {
    createStory,
    getStories,
    getStoryById
}
