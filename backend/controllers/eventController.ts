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

const validateEventType = (type: string) => {
    const valid = ['birthday', 'gathering', 'anniversary', 'celebration', 'appointment', 'other']
    return valid.includes(type)
}

const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, type, startAt, endAt, location, relatedMemberId, visibility, recurrence } = req.body
    const userId = req.user?._id
    const familyId = req.user?.familyId

    if (!userId || !familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    if (!title || !startAt) {
        res.status(400).json({ success: false, message: 'Title and start date are required' })
        return
    }

    if (type && !validateEventType(type)) {
        res.status(400).json({ success: false, message: 'Unsupported event type' })
        return
    }

    if (endAt && new Date(endAt) < new Date(startAt)) {
        res.status(400).json({ success: false, message: 'End time cannot be before start time' })
        return
    }

    try {
        const event = await EventModel.create({
            title: title.trim(),
            description: description?.trim() || '',
            type: type || 'other',
            startAt: new Date(startAt),
            endAt: endAt ? new Date(endAt) : undefined,
            location: location?.trim() || '',
            relatedMemberId: relatedMemberId || undefined,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId,
            createdBy: userId,
            visibility: visibility || 'family',
            recurrence: recurrence || undefined
        })

        res.status(201).json({ success: true, event })
    } catch (error) {
        console.log((error as Error).message)
        if ((error as any).name === 'ValidationError') {
            const messages = Object.values((error as any).errors).map((e: any) => e.message)
            res.status(400).json({ success: false, message: messages.join(', ') })
            return
        }
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
        const { upcoming, from, to } = req.query
        const familyFilter = typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId
        const filter: any = { familyId: familyFilter }

        if (upcoming === 'true') {
            filter.startAt = { $gte: new Date() }
        }

        if (from) {
            filter.startAt = filter.startAt || {}
            filter.startAt.$gte = new Date(from as string)
        }

        if (to) {
            filter.startAt = filter.startAt || {}
            filter.startAt.$lte = new Date(to as string)
        }

        const events = await EventModel.find(filter)
            .sort({ startAt: 1 })
            .limit(upcoming === 'true' ? 5 : 100)
            .populate('relatedMemberId', 'fullName')
            .populate('createdBy', 'fullName')
        res.status(200).json({ success: true, events })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch events' })
    }
}

const getEventById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const familyId = req.user?.familyId

    if (!familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const event = await EventModel.findOne({
            _id: id,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId
        })
            .populate('relatedMemberId', 'fullName')
            .populate('createdBy', 'fullName')

        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' })
            return
        }

        res.status(200).json({ success: true, event })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to fetch event' })
    }
}

const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const { title, description, type, startAt, endAt, location, relatedMemberId, visibility, recurrence } = req.body
    const familyId = req.user?.familyId

    if (!familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    if (type && !validateEventType(type)) {
        res.status(400).json({ success: false, message: 'Unsupported event type' })
        return
    }

    if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
        res.status(400).json({ success: false, message: 'End time cannot be before start time' })
        return
    }

    try {
        const event = await EventModel.findOne({
            _id: id,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId
        })

        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' })
            return
        }

        const updateData: any = {}
        if (title !== undefined) updateData.title = title.trim()
        if (description !== undefined) updateData.description = description.trim()
        if (type) updateData.type = type
        if (startAt) updateData.startAt = new Date(startAt)
        if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null
        if (location !== undefined) updateData.location = location.trim()
        if (relatedMemberId !== undefined) updateData.relatedMemberId = relatedMemberId || null
        if (visibility) updateData.visibility = visibility
        if (recurrence !== undefined) updateData.recurrence = recurrence

        const updatedEvent = await EventModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('relatedMemberId', 'fullName')
            .populate('createdBy', 'fullName')

        res.status(200).json({ success: true, event: updatedEvent })
    } catch (error) {
        console.log((error as Error).message)
        if ((error as any).name === 'ValidationError') {
            const messages = Object.values((error as any).errors).map((e: any) => e.message)
            res.status(400).json({ success: false, message: messages.join(', ') })
            return
        }
        res.status(500).json({ success: false, message: 'Failed to update event' })
    }
}

const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params
    const familyId = req.user?.familyId

    if (!familyId) {
        res.status(400).json({ success: false, message: 'User or family not found' })
        return
    }

    try {
        const event = await EventModel.findOne({
            _id: id,
            familyId: typeof familyId === 'string' ? new mongoose.Types.ObjectId(familyId) : familyId
        })

        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found' })
            return
        }

        await EventModel.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: 'Event deleted successfully' })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to delete event' })
    }
}

export default {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
}