import { Request, Response, NextFunction } from "express"
import { streamClient } from "../utils/stream.js"
import { UserModel } from "../models/user.model.js"
import { FamilyModel } from "../models/family.model.js"

interface AuthRequest extends Request {
  user?: {
    _id: string
    fullName: string
    email: string
    familyId?: string | import("mongoose").Types.ObjectId
  }
}

const generateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" })
    return
  }

  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" })
      return
    }

    const token = streamClient.generateUserToken({
      user_id: user._id.toString(),
      validity_in_seconds: 60 * 60,
    })

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        familyId: user.familyId,
      },
    })
  } catch (error) {
    console.log("Stream token error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to generate Stream token" })
  }
}

const getCallType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const callType = "family_meeting"
    const callId = `imizi_call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const call = streamClient.video.call(callType, callId)
    await call.create({
      data: {
        custom: {
          familyId: req.user?.familyId || "",
        },
      },
    })
    res.status(200).json({
      success: true,
      callId: call.id,
      callType: call.type,
    })
  } catch (error) {
    console.log("Stream call type error:", (error as Error).message)
    res.status(500).json({ success: false, message: "Failed to initialize call type" })
  }
}

export default {
  generateToken,
  getCallType,
}
