import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import dashboardController from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/', isLoggedIn, dashboardController.getDashboardData)

export default router
