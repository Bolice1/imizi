import express from 'express'
import userControllers from '../controllers/userControllers.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import { upload } from '../middlewares/upload.js'


const router = express.Router()

router.post('/register', userControllers.register)
router.post('/login', userControllers.logIn)
router.post('/forgot-password', userControllers.forgotPassword)
router.post('/reset-password/:resetToken', userControllers.restPassword)
router.get('/profile', isLoggedIn, userControllers.getProfile)
router.put('/profile', isLoggedIn, userControllers.updateProfile)
router.post('/profile-picture', isLoggedIn, upload.single('profilePicture'), userControllers.uploadProfilePicture)

export default router
