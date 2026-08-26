import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { MemoryModel } from '../models/memory.model.js'
import { StoryModel } from '../models/story.model.js'
import { EventModel } from '../models/event.model.js'
import { CommentModel } from '../models/comment.model.js'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
        familyId?: string | mongoose.Types.ObjectId
    }
}

const getDashboardData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        if (!req.user?.familyId) {
            res.status(200).json({
                success: true,
                hasFamily: false,
                message: 'No family found'
            })
            return
        }

        const familyId = typeof req.user.familyId === 'string' ? new mongoose.Types.ObjectId(req.user.familyId) : req.user.familyId

        const [upcomingEvents, memories, stories, comments] = await Promise.all([
            EventModel.find({ familyId }).sort({ date: 1 }).limit(3),
            MemoryModel.find({ familyId }).sort({ createdAt: -1 }).limit(10).populate('uploadedBy', 'fullName'),
            StoryModel.find({ familyId }).sort({ createdAt: -1 }).limit(5).populate('author', 'fullName'),
            CommentModel.find({ familyId }).sort({ createdAt: -1 }).limit(5).populate('author', 'fullName')
        ])

        const totalMemories = await MemoryModel.countDocuments({ familyId })
        const totalStories = await StoryModel.countDocuments({ familyId })
        const activeMembers = new Set([
            ...(await MemoryModel.find({ familyId }).distinct('uploadedBy')),
            ...(await StoryModel.find({ familyId }).distinct('author'))
        ]).size

        const family = await mongoose.model('Family').findById(familyId).select('familyMembers')

        res.status(200).json({
            success: true,
            hasFamily: true,
            data: {
                upcomingEvents,
                memories,
                stories,
                recentComments: comments,
                stats: {
                    totalMemories,
                    totalStories,
                    activeMembers,
                    totalMembers: family?.familyMembers?.length || 0
                }
            }
        })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' })
    }
}

export default {
    getDashboardData
}
