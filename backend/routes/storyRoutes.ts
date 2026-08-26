import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import storyController from '../controllers/storyController.js'

const router = express.Router()

router.post('/', isLoggedIn, storyController.createStory)
router.get('/', isLoggedIn, storyController.getStories)
router.get('/:id', isLoggedIn, storyController.getStoryById)

export default router
