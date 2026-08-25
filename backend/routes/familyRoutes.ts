import express from 'express'
import familyControllers from '../controllers/familyControllers.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'

const router = express.Router()

router.post('/create', isLoggedIn, familyControllers.createFamily)
router.post('/invite', isLoggedIn, familyControllers.inviteMember)
router.post('/join', isLoggedIn, familyControllers.joinFamily)
router.get('/my-family', isLoggedIn, familyControllers.getMyFamily)
router.get('/invite/:token', familyControllers.getInvite)

export default router
