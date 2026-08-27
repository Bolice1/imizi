import express from "express"
import { isLoggedIn } from "../middlewares/isLoggedIn.js"
import meetingController from "../controllers/meetingController.js"

const router = express.Router()

router.post("/", isLoggedIn, meetingController.createMeeting)
router.get("/", isLoggedIn, meetingController.getMeetings)
router.get("/:id", isLoggedIn, meetingController.getMeetingById)
router.patch("/:id", isLoggedIn, meetingController.updateMeeting)
router.post("/:id/end", isLoggedIn, meetingController.endMeeting)
router.post("/:id/preserve-memory", isLoggedIn, meetingController.preserveMemory)
router.delete("/:id", isLoggedIn, meetingController.deleteMeeting)

export default router
