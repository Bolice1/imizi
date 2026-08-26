import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import memoryController from '../controllers/memoryController.js'

const router = express.Router()

router.post('/', isLoggedIn, memoryController.createMemory)
router.get('/', isLoggedIn, memoryController.getMemories)
router.get('/:id', isLoggedIn, memoryController.getMemoryById)

export default router
