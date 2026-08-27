import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk'

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || ''

export function getStreamClient(userToken: string, userId: string) {
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_STREAM_API_KEY')
  }
  const client = new StreamVideoClient({
    apiKey,
    user: { id: userId },
    token: userToken,
  })
  return client
}

export function StreamVideoProvider({ children, client }: { children: React.ReactNode; client: StreamVideoClient }) {
  return <StreamVideo client={client}>{children}</StreamVideo>
}
