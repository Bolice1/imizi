import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error("MONGO_URI is not set")
  process.exit(1)
}

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["family_meeting", "instant_call", "scheduled"],
        message: "Unsupported meeting type",
      },
      default: "family_meeting",
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "active", "ended", "cancelled"],
        message: "Unsupported meeting status",
      },
      default: "scheduled",
    },
    scheduledAt: {
      type: Date,
      required: false,
    },
    startedAt: {
      type: Date,
      required: false,
    },
    endedAt: {
      type: Date,
      required: false,
    },
    streamCallType: {
      type: String,
      required: true,
      default: "family_meeting",
    },
    streamCallId: {
      type: String,
      required: true,
      unique: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["host", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          required: false,
        },
        leftAt: {
          type: Date,
          required: false,
        },
      },
    ],
    recording: {
      enabled: {
        type: Boolean,
        default: false,
      },
      consentRequired: {
        type: Boolean,
        default: true,
      },
      consentGivenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      consentGivenAt: {
        type: Date,
        required: false,
      },
      recordingUrl: {
        type: String,
        required: false,
      },
      recordingStatus: {
        type: String,
        enum: ["none", "started", "processing", "ready", "failed"],
        default: "none",
      },
    },
    transcription: {
      enabled: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["none", "started", "processing", "ready", "failed"],
        default: "none",
      },
      transcriptUrl: {
        type: String,
        required: false,
      },
    },
    preservedAsMemory: {
      type: Boolean,
      default: false,
    },
    memoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
      required: false,
    },
    visibility: {
      type: String,
      enum: {
        values: ["family", "private"],
        message: "Visibility must be family or private",
      },
      default: "family",
    },
  },
  { timestamps: true }
)

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

const runMigration = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("Connected to MongoDB")

    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }

    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("meetings")) {
      await db.createCollection("meetings")
      console.log("Created 'meetings' collection")
    } else {
      console.log("'meetings' collection already exists")
    }

    if (!collectionNames.includes("webhookevents")) {
      await db.createCollection("webhookevents")
      console.log("Created 'webhookevents' collection")
    } else {
      console.log("'webhookevents' collection already exists")
    }

    const Meeting = mongoose.model("Meeting", meetingSchema)
    const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema)

    await Meeting.syncIndexes()
    console.log("Synced indexes for 'meetings' collection")

    await WebhookEvent.syncIndexes()
    console.log("Synced indexes for 'webhookevents' collection")

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", (error as Error).message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

runMigration()
