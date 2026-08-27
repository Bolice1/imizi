import express from "express"
import webhookController from "../controllers/webhookController.js"

const router = express.Router()

router.post("/stream", express.raw({ type: "application/json" }), webhookController.handleStreamWebhook)

export default router
