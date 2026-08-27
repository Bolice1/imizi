import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import eventController from '../controllers/eventController.js'

const router = express.Router()

router.post('/', isLoggedIn, eventController.createEvent)
router.get('/', isLoggedIn, eventController.getEvents)
router.get('/:id', isLoggedIn, eventController.getEventById)
router.patch('/:id', isLoggedIn, eventController.updateEvent)
router.delete('/:id', isLoggedIn, eventController.deleteEvent)

export default router
