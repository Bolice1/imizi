import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { EventModel } from '../models/event.model.js'

interface AuthRequest extends Request {
    user?: {
        _id: string
        fullName: string
        email: string
        familyId?: string | mongoose.Types.ObjectId
    }
}

const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, type, date } = req.body
    const userId = req.user?._id
    const familyId = req.user?.familyId

    if (!userId || !familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const event = await EventModel.create({
            title,
            description,
            type,
            date,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId,
            createdBy: userId
        })

        res.status(201).json({ success: true, event })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to create event' })
    }
}

const getEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const familyId = req.user?.familyId

    if (!familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const { upcoming = 'true' } = req.query
        const now = new Date()
        const filter: any = { familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId }
        if (upcoming === 'true') {
            filter.date = { $gte: now }
        }

        const events = await EventModel.find(filter).sort({ date: 1 }).limit(upcoming === 'true' ? 5 : 50)
        res.status(200).json({ success: true, events })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch events' })
    }
}

export default {
    createEvent,
    getEvents
}
