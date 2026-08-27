import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import memoryController from '../controllers/memoryController.js'

const router = express.Router()

router.post('/', isLoggedIn, memoryController.createMemory)
router.get('/', isLoggedIn, memoryController.getMemories)
router.put('/:id', isLoggedIn, memoryController.updateMemory)
router.delete('/:id', isLoggedIn, memoryController.deleteMemory)
router.post('/:id/like', isLoggedIn, memoryController.toggleLike)

export default router
