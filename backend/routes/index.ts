import express from 'express'
import userRoutes from './userRoutes.js'
import familyRoutes from './familyRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import memoryRoutes from './memoryRoutes.js'
import storyRoutes from './storyRoutes.js'
import eventRoutes from './eventRoutes.js'
import commentRoutes from './commentRoutes.js'
import uploadRoutes from './uploadRoutes.js'

const router = express.Router()

router.use('/auth', userRoutes)
router.use('/family', familyRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/memories', memoryRoutes)
router.use('/stories', storyRoutes)
router.use('/events', eventRoutes)
router.use('/comments', commentRoutes)
router.use('/upload', uploadRoutes)

export default router
