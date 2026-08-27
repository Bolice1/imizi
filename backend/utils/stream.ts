import { StreamClient } from "@stream-io/node-sdk"

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if (!apiKey || !apiSecret) {
  throw new Error("Missing Stream env vars: STREAM_API_KEY, STREAM_API_SECRET")
}

export const streamClient = new StreamClient(apiKey, apiSecret, {
  timeout: 15000,
})

export type { StreamClient }
