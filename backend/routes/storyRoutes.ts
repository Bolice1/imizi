import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import storyController from '../controllers/storyController.js'

const router = express.Router()

router.post('/', isLoggedIn, storyController.createStory)
router.get('/', isLoggedIn, storyController.getStories)

export default router
