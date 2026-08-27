import express from 'express'
import familyControllers from '../controllers/familyControllers.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'

const router = express.Router()

router.post('/create', isLoggedIn, familyControllers.createFamily)
router.post('/invite', isLoggedIn, familyControllers.inviteMember)
router.post('/join', isLoggedIn, familyControllers.joinFamily)
router.post('/members', isLoggedIn, familyControllers.addFamilyMember)
router.put('/members/:id', isLoggedIn, familyControllers.updateFamilyMember)
router.get('/my-family', isLoggedIn, familyControllers.getMyFamily)
router.get('/tree', isLoggedIn, familyControllers.getFamilyTree)
router.get('/invite/:code', familyControllers.getInvite)
router.post('/invite-link', isLoggedIn, familyControllers.generateInviteLink)

export default router
