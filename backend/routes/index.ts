import express from 'express'
import userRoutes from './userRoutes.js'
import familyRoutes from './familyRoutes.js'

const router = express.Router()

router.use('/auth', userRoutes)
router.use('/family', familyRoutes)

export default router
