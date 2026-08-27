import { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import { MeetingModel } from "../models/meeting.model.js"
import { FamilyModel } from "../models/family.model.js"
import { UserModel } from "../models/user.model.js"
import { MemoryModel } from "../models/memory.model.js"
import { streamClient } from "../utils/stream.js"

interface AuthRequest extends Request {
  user?: {
    _id: string
    fullName: string
    email: string
    familyId?: string | mongoose.Types.ObjectId
  }
}

const createMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const {
    title,
    description,
    type,
    scheduledAt,
    participantIds,
    recordingEnabled,
    transcriptionEnabled,
    visibility,
  } = req.body
  const userId = req.user?._id
  const familyId = req.user?.familyId

  if (!userId || !familyId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  if (!title) {
    res.status(400).json({ success: false, message: "Title is required" })
    return
  }

  try {
    const family = await FamilyModel.findById(familyId)
    if (!family) {
      res.status(404).json({ success: false, message: "Family not found" })
      return
    }

    const members = family.familyMembers || []
    const validParticipantIds = (participantIds || [])
      .map((id: string) => new mongoose.Types.ObjectId(id))
      .filter((pid: mongoose.Types.ObjectId) => members.some((m: any) => m.equals(pid)))

    if (!validParticipantIds.some((pid: mongoose.Types.ObjectId) => pid.equals(new mongoose.Types.ObjectId(userId)))) {
      validParticipantIds.unshift(new mongoose.Types.ObjectId(userId))
    }

    const callId = `imizi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const call = streamClient.video.call("family_meeting", callId)
    await call.create({
      data: {
        created_by: {
          id: userId,
          name: req.user?.fullName || "",
        },
        members: validParticipantIds.map((pid: mongoose.Types.ObjectId) => ({ user_id: pid.toString() })),
        custom: {
          familyId: familyId.toString(),
          title: title.trim(),
          type: type || "family_meeting",
        },
      },
    })

    const meeting = await MeetingModel.create({
      title: title.trim(),
      description: description?.trim() || "",
      type: type || "family_meeting",
      status: scheduledAt && new Date(scheduledAt) > new Date() ? "scheduled" : "active",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      streamCallType: "family_meeting",
      streamCallId: call.id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
      createdBy: userId,
      hostId: userId,
      participants: validParticipantIds.map((pid: mongoose.Types.ObjectId) => ({
        userId: pid,
        role: pid.toString() === userId.toString() ? "host" : "member",
      })),
      recording: {
        enabled: Boolean(recordingEnabled),
        consentRequired: true,
        recordingStatus: "none",
      },
      transcription: {
        enabled: Boolean(transcriptionEnabled),
        status: "none",
      },
      visibility: visibility || "family",
    })

    res.status(201).json({ success: true, meeting })
  } catch (error) {
    console.log("Create meeting error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to create meeting" })
  }
}

const getMeetings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const familyId = req.user?.familyId

  if (!familyId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const filter =
      typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId

    const meetings = await MeetingModel.find({ familyId: filter })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email")
      .populate("hostId", "fullName email")
      .populate("participants.userId", "fullName email")

    res.status(200).json({ success: true, meetings })
  } catch (error) {
    console.log("Get meetings error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to fetch meetings" })
  }
}

const getMeetingById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const familyId = req.user?.familyId

  if (!familyId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const meeting = await MeetingModel.findOne({
      _id: id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
    })
      .populate("createdBy", "fullName email")
      .populate("hostId", "fullName email")
      .populate("participants.userId", "fullName email")

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" })
      return
    }

    res.status(200).json({ success: true, meeting })
  } catch (error) {
    console.log("Get meeting error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to fetch meeting" })
  }
}

const updateMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const familyId = req.user?.familyId
  const userId = req.user?._id

  if (!familyId || !userId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const meeting = await MeetingModel.findOne({
      _id: id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
    })

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" })
      return
    }

    const isAuthorized = meeting.createdBy.toString() === userId.toString() || meeting.hostId.toString() === userId.toString()
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: "Not authorized to update this meeting" })
      return
    }

    const allowedFields = ["title", "description", "scheduledAt", "visibility", "status"]
    const updateData: any = {}
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key]
      }
    }

    if (req.body.recordingEnabled !== undefined) {
      updateData["recording.enabled"] = Boolean(req.body.recordingEnabled)
    }
    if (req.body.transcriptionEnabled !== undefined) {
      updateData["transcription.enabled"] = Boolean(req.body.transcriptionEnabled)
    }

    const updated = await MeetingModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "fullName email")
      .populate("hostId", "fullName email")
      .populate("participants.userId", "fullName email")

    res.status(200).json({ success: true, meeting: updated })
  } catch (error) {
    console.log("Update meeting error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to update meeting" })
  }
}

const endMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const familyId = req.user?.familyId
  const userId = req.user?._id

  if (!familyId || !userId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const meeting = await MeetingModel.findOne({
      _id: id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
    })

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" })
      return
    }

    const isHost = meeting.hostId.toString() === userId.toString()
    if (!isHost) {
      res.status(403).json({ success: false, message: "Only the host can end the meeting" })
      return
    }

    meeting.status = "ended"
    meeting.endedAt = new Date()
    await meeting.save()

    try {
      const call = streamClient.video.call(meeting.streamCallType, meeting.streamCallId)
      await call.end()
    } catch (streamError) {
      console.log("Stream end call error:", (streamError as Error).message)
    }

    res.status(200).json({ success: true, message: "Meeting ended", meeting })
  } catch (error) {
    console.log("End meeting error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to end meeting" })
  }
}

const deleteMeeting = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const familyId = req.user?.familyId
  const userId = req.user?._id

  if (!familyId || !userId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const meeting = await MeetingModel.findOne({
      _id: id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
    })

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" })
      return
    }

    const isAuthorized = meeting.createdBy.toString() === userId.toString() || meeting.hostId.toString() === userId.toString()
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: "Not authorized to delete this meeting" })
      return
    }

    await MeetingModel.findByIdAndDelete(id)
    res.status(200).json({ success: true, message: "Meeting deleted" })
  } catch (error) {
    console.log("Delete meeting error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to delete meeting" })
  }
}

const preserveMemory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const familyId = req.user?.familyId
  const userId = req.user?._id

  if (!familyId || !userId) {
    res.status(400).json({ success: false, message: "User or family not found" })
    return
  }

  try {
    const meeting = await MeetingModel.findOne({
      _id: id,
      familyId: typeof familyId === "string" ? new mongoose.Types.ObjectId(familyId) : familyId,
    })

    if (!meeting) {
      res.status(404).json({ success: false, message: "Meeting not found" })
      return
    }

    const isAuthorized = meeting.createdBy.toString() === userId.toString() || meeting.hostId.toString() === userId.toString()
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: "Only the host or creator can preserve this meeting" })
      return
    }

    if (meeting.preservedAsMemory) {
      res.status(200).json({ success: true, message: "Meeting already preserved", meeting })
      return
    }

    const duration = meeting.startedAt && meeting.endedAt
      ? Math.round((meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 1000)
      : 0

    const participantNames = (meeting.participants || [])
      .filter((p) => p.role === "member")
      .map((p) => p.userId?.toString())
      .filter(Boolean)

    const memory = await MemoryModel.create({
      title: meeting.title,
      description: meeting.description || `Family meeting on ${new Date(meeting.createdAt).toLocaleDateString()}`,
      type: "video",
      mediaUrl: meeting.recording?.recordingUrl || "",
      familyId: meeting.familyId,
      uploadedBy: userId,
      tags: ["meeting", "family", ...(meeting.recording?.recordingUrl ? ["recording"] : [])],
    })

    meeting.preservedAsMemory = true
    meeting.memoryId = memory._id as mongoose.Types.ObjectId
    await meeting.save()

    res.status(200).json({
      success: true,
      message: "Meeting preserved as family memory",
      memory,
      meeting,
    })
  } catch (error) {
    console.log("Preserve memory error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to preserve meeting as memory" })
  }
}

export default {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  endMeeting,
  deleteMeeting,
  preserveMemory,
}
