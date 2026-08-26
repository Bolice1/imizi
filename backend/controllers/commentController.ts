import { Request, Response, NextFunction } from 'express'
import { CommentModel } from '../models/comment.model.js'

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

        res.status(201).json({ success: true, comment })
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
            .populate('userId', 'fullName')
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
