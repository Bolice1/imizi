import mongoose from 'mongoose'


export const familySchema = new mongoose.Schema({
    familyName: {
        type: String,
        required: true,
        unique: false
    },
    familyMembers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false,
        unique: false
    },


})

export const FamilyModel = mongoose.model('Family', familySchema)
