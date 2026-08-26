import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import eventController from '../controllers/eventController.js'

const router = express.Router()

router.post('/', isLoggedIn, eventController.createEvent)
router.get('/', isLoggedIn, eventController.getEvents)

export default router
