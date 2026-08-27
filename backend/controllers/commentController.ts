import { Request, Response, NextFunction } from 'express'
import { CommentModel } from '../models/comment.model.js'
import { MemoryModel } from '../models/memory.model.js'
import { StoryModel } from '../models/story.model.js'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
    }
}

const createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { content, targetType, targetId } = req.body
    const userId = req.user?._id

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const comment = await CommentModel.create({
            content,
            userId,
            targetType,
            targetId
        })

        if (targetType === 'memory') {
            await MemoryModel.findByIdAndUpdate(targetId, { $addToSet: { comments: comment._id } })
        } else if (targetType === 'story') {
            await StoryModel.findByIdAndUpdate(targetId, { $addToSet: { comments: comment._id } })
        }

        const populated = await CommentModel.findById(comment._id).populate('userId', '_id fullName profilePicture')

        res.status(201).json({ success: true, comment: populated })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to create comment' })
    }
}

const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { targetType, targetId } = req.params

    try {
        const comments = await CommentModel.find({
            targetType: targetType as 'memory' | 'story',
            targetId
        })
            .populate('userId', '_id fullName profilePicture')
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, comments })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch comments' })
    }
}

export default {
    createComment,
    getComments
}
