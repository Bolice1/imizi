import { Request, Response, NextFunction } from "express"
import { InvalidWebhookError, WHEvent } from "@stream-io/node-sdk"
import mongoose from "mongoose"
import { MeetingModel } from "../models/meeting.model.js"
import { streamClient } from "../utils/stream.js"

const WEBHOOK_SECRET = process.env.STREAM_API_SECRET

interface WebhookEventDocument extends mongoose.Document {
  eventId: string
  type: string
  callCid: string
  processedAt: Date
  createdAt: Date
  updatedAt: Date
}

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    callCid: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const getWebhookEventModel = () => {
  try {
    return mongoose.model<WebhookEventDocument>("WebhookEvent")
  } catch {
    return mongoose.model<WebhookEventDocument>("WebhookEvent", webhookEventSchema)
  }
}

const extractCallCid = (event: WHEvent): string | null => {
  const anyEvent = event as any
  return anyEvent.call_cid || null
}

const extractEventId = (event: WHEvent): string | null => {
  const anyEvent = event as any
  return anyEvent.event_id || anyEvent.id || null
}

const isDeduplicated = async (eventId: string): Promise<boolean> => {
  const WebhookEvent = getWebhookEventModel()
  const existing = await WebhookEvent.findOne({ eventId })
  return !!existing
}

const recordEvent = async (eventId: string, type: string, callCid: string): Promise<void> => {
  const WebhookEvent = getWebhookEventModel()
  await WebhookEvent.create({ eventId, type, callCid })
}

const findMeetingByCallCid = async (callCid: string) => {
  const callId = callCid.split(":").pop() || callCid
  return MeetingModel.findOne({ streamCallId: callId })
}

const handleRecordingStarted = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.recording) return

  meeting.recording.recordingStatus = "started"
  meeting.recording.enabled = true
  await meeting.save()
}

const handleRecordingStopped = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.recording) return

  meeting.recording.recordingStatus = "processing"
  await meeting.save()
}

const handleRecordingReady = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const anyEvent = event as any
  const recordingUrl = anyEvent.call_recording?.url || anyEvent.call_recording?.download_url || undefined

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.recording) return

  meeting.recording.recordingStatus = "ready"
  if (recordingUrl) {
    meeting.recording.recordingUrl = recordingUrl
  }
  await meeting.save()
}

const handleRecordingFailed = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.recording) return

  meeting.recording.recordingStatus = "failed"
  await meeting.save()
}

const handleTranscriptionStarted = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.transcription) return

  meeting.transcription.status = "started"
  meeting.transcription.enabled = true
  await meeting.save()
}

const handleTranscriptionStopped = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.transcription) return

  meeting.transcription.status = "processing"
  await meeting.save()
}

const handleTranscriptionReady = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const anyEvent = event as any
  const transcriptUrl = anyEvent.call_transcription?.url || anyEvent.call_transcription?.download_url || undefined

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.transcription) return

  meeting.transcription.status = "ready"
  if (transcriptUrl) {
    meeting.transcription.transcriptUrl = transcriptUrl
  }
  await meeting.save()
}

const handleTranscriptionFailed = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting || !meeting.transcription) return

  meeting.transcription.status = "failed"
  await meeting.save()
}

const handleCallEnded = async (event: WHEvent): Promise<void> => {
  const callCid = extractCallCid(event)
  if (!callCid) return

  const meeting = await findMeetingByCallCid(callCid)
  if (!meeting) return

  meeting.status = "ended"
  meeting.endedAt = new Date()
  await meeting.save()
}

const handleStreamWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!WEBHOOK_SECRET) {
    console.error("STREAM_API_SECRET is not configured")
    res.status(500).json({ success: false, message: "Webhook not configured" })
    return
  }

  const signature = req.headers["x-signature"] as string
  if (!signature) {
    res.status(401).json({ success: false, message: "Missing signature" })
    return
  }

  const rawBody = (req as any).rawBody || req.body

  let event: WHEvent
  try {
    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : JSON.stringify(rawBody)
    event = streamClient.verifyAndParseWebhook(bodyBuffer, signature)
  } catch (error) {
    if (error instanceof InvalidWebhookError) {
      res.status(401).json({ success: false, message: "Invalid webhook signature" })
      return
    }
    console.error("Webhook verification error:", (error as Error).message)
    res.status(400).json({ success: false, message: "Invalid webhook payload" })
    return
  }

  const eventId = extractEventId(event)
  const callCid = extractCallCid(event)
  const eventType = (event as any).type

  if (!eventId || !callCid) {
    res.status(200).json({ success: true, message: "Event ignored" })
    return
  }

  try {
    if (await isDeduplicated(eventId)) {
      res.status(200).json({ success: true, message: "Event already processed" })
      return
    }

    await recordEvent(eventId, eventType, callCid)

    switch (eventType) {
      case "call.recording_started":
        await handleRecordingStarted(event)
        break
      case "call.recording_stopped":
        await handleRecordingStopped(event)
        break
      case "call.recording_ready":
        await handleRecordingReady(event)
        break
      case "call.recording_failed":
        await handleRecordingFailed(event)
        break
      case "call.transcription_started":
        await handleTranscriptionStarted(event)
        break
      case "call.transcription_stopped":
        await handleTranscriptionStopped(event)
        break
      case "call.transcription_ready":
        await handleTranscriptionReady(event)
        break
      case "call.transcription_failed":
        await handleTranscriptionFailed(event)
        break
      case "call.ended":
        await handleCallEnded(event)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    res.status(200).json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook processing error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to process webhook" })
  }
}

export default {
  handleStreamWebhook,
}
