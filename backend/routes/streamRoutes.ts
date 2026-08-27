import express from "express"
import { isLoggedIn } from "../middlewares/isLoggedIn.js"
import streamController from "../controllers/streamController.js"

const router = express.Router()

router.get("/token", isLoggedIn, streamController.generateToken)
router.post("/call-type", isLoggedIn, streamController.getCallType)

export default router
