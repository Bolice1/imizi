import mongoose from 'mongoose'

export const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const InvitationModel = mongoose.model('Invitation', invitationSchema)
