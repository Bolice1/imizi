import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import commentController from '../controllers/commentController.js'

const router = express.Router()

router.post('/', isLoggedIn, commentController.createComment)
router.get('/:targetType/:targetId', isLoggedIn, commentController.getComments)

export default router
