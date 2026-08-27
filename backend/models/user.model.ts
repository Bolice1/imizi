import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: false,
        unique: false
    },
    role: {
        type: String,
        unique: false,
        enum: ['admin_family', 'user'],
        default: 'user'
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },

    invitationCode: {
        type: String,
        required: false,
        unique: false
    },

    resetToken: String,
    resetTokenExpires: Number,

    profilePicture: {
        type: String,
        required: false,
        unique: false
    },

    generation: {
        type: Number,
        required: false,
        unique: false
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        unique: false
    },

    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        unique: false
    },

    status: {
        type: String,
        required: false,
        enum: ['living', 'remembered'],
        default: 'living'
    },

    relationship: {
        type: String,
        required: false,
        unique: false
    },

    gender: {
        type: String,
        required: false,
        unique: false,
        enum: ['male', 'female']
    }

}, { timestamps: true })

export const UserModel = mongoose.model('User', userSchema)
