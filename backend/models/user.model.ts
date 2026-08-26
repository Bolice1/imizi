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
    resetTokenExpires: Number

}, { timestamps: true })


export const UserModel = mongoose.model('User', userSchema)
