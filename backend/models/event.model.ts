import mongoose from 'mongoose'

export const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['birthday', 'gathering', 'anniversary', 'other'],
        default: 'other'
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

export const EventModel = mongoose.model('Event', eventSchema)
