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
    const { title, content, audioUrl, toldBy, thumbnailUrl } = req.body
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
            thumbnailUrl,
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
        const stories = await StoryModel.find({ familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId }).sort({ createdAt: -1 }).populate('author', '_id fullName profilePicture')
        res.status(200).json({ success: true, stories })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch stories' })
    }
}

const toggleStoryLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid story id' })
        return
    }

    try {
        const story = await StoryModel.findById(id)

        if (!story) {
            res.status(404).json({ success: false, message: 'Story not found' })
            return
        }

        const hasLiked = story.likes?.some((likeId) => likeId.equals(userId as any))

        if (hasLiked) {
            await StoryModel.findByIdAndUpdate(id, { $pull: { likes: userId } })
        } else {
            await StoryModel.findByIdAndUpdate(id, { $addToSet: { likes: userId } })
        }

        const updated = await StoryModel.findById(id).populate('author', '_id fullName profilePicture')

        res.status(200).json({ success: true, story: updated, liked: !hasLiked })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to toggle like' })
    }
}

const updateStory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const { title, content, toldBy, thumbnailUrl } = req.body
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid story id' })
        return
    }

    try {
        const story = await StoryModel.findById(id)

        if (!story) {
            res.status(404).json({ success: false, message: 'Story not found' })
            return
        }

        if (!story.author.equals(userId)) {
            res.status(403).json({ success: false, message: 'Not authorized to update this story' })
            return
        }

        const updated = await StoryModel.findByIdAndUpdate(
            id,
            { title, content, toldBy, thumbnailUrl },
            { new: true }
        )

        res.status(200).json({ success: true, story: updated })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to update story' })
    }
}

const deleteStory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ success: false, message: 'Invalid story id' })
        return
    }

    try {
        const story = await StoryModel.findById(id)

        if (!story) {
            res.status(404).json({ success: false, message: 'Story not found' })
            return
        }

        if (!story.author.equals(userId)) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this story' })
            return
        }

        await StoryModel.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: 'Story deleted successfully' })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to delete story' })
    }
}

export default {
    createStory,
    getStories,
    updateStory,
    deleteStory,
    toggleStoryLike
}
