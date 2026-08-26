import mongoose from 'mongoose'

export const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    audioUrl: String,
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toldBy: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true })

export const StoryModel = mongoose.model('Story', storySchema)
