import express from 'express'
import userRoutes from './userRoutes.js'
import familyRoutes from './familyRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import memoryRoutes from './memoryRoutes.js'
import storyRoutes from './storyRoutes.js'
import eventRoutes from './eventRoutes.js'
import commentRoutes from './commentRoutes.js'
import uploadRoutes from './uploadRoutes.js'
import streamRoutes from './streamRoutes.js'
import meetingRoutes from './meetingRoutes.js'
import webhookRoutes from './webhookRoutes.js'

const router = express.Router()

router.use('/auth', userRoutes)
router.use('/family', familyRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/memories', memoryRoutes)
router.use('/stories', storyRoutes)
router.use('/events', eventRoutes)
router.use('/comments', commentRoutes)
router.use('/upload', uploadRoutes)
router.use('/stream', streamRoutes)
router.use('/meetings', meetingRoutes)
router.use('/webhooks', webhookRoutes)

export default router
