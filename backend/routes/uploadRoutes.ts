import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import uploadController from '../controllers/uploadController.js'
import { upload } from '../middlewares/upload.js'

const router = express.Router()

router.post('/', isLoggedIn, upload.single('file'), uploadController.uploadFile)

export default router
