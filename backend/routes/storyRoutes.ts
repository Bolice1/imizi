import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import storyController from '../controllers/storyController.js'

const router = express.Router()

router.post('/', isLoggedIn, storyController.createStory)
router.get('/', isLoggedIn, storyController.getStories)
router.put('/:id', isLoggedIn, storyController.updateStory)
router.delete('/:id', isLoggedIn, storyController.deleteStory)
router.post('/:id/like', isLoggedIn, storyController.toggleStoryLike)

export default router
