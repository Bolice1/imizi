import mongoose from 'mongoose'

export const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        enum: {
            values: ['birthday', 'gathering', 'anniversary', 'celebration', 'appointment', 'other'],
            message: 'Unsupported event type'
        },
        default: 'other'
    },
    startAt: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endAt: {
        type: Date,
        validate: {
            validator: function (this: any, value: Date) {
                if (!value) return true
                return value >= this.startAt
            },
            message: 'End time cannot be before start time'
        }
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    relatedMemberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: [true, 'Family is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    visibility: {
        type: String,
        enum: {
            values: ['family', 'private'],
            message: 'Visibility must be family or private'
        },
        default: 'family'
    },
    recurrence: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true })

export const EventModel = mongoose.model('Event', eventSchema)
