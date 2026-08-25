import express from 'express'
import userControllers from '../controllers/userControllers.js'


const router = express.Router()

router.post('/register', userControllers.register)
router.post('/login', userControllers.logIn)
router.post('/forgot-password', userControllers.forgotPassword)
router.post('/reset-password/:resetToken', userControllers.restPassword)

export default router
