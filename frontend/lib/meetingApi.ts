const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers = new Headers({
        'Content-Type': 'application/json',
    })

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (!res.ok) {
        let errorMessage = `HTTP ${res.status}`
        try {
            const error = await res.json()
            errorMessage = error.message || errorMessage
        } catch {
            const text = await res.text()
            errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
    }

    return res.json()
}

export const meetingApi = {
    getMeetings: () => request('/meetings'),
    getMeeting: (id: string) => request(`/meetings/${id}`),
    createMeeting: (data: unknown) => request('/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateMeeting: (id: string, data: unknown) => request(`/meetings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    endMeeting: (id: string) => request(`/meetings/${id}/end`, {
        method: 'POST',
    }),
    preserveMemory: (id: string) => request(`/meetings/${id}/preserve-memory`, {
        method: 'POST',
    }),
    deleteMeeting: (id: string) => request(`/meetings/${id}`, {
        method: 'DELETE',
    }),
    getStreamToken: () => request('/stream/token'),
    createCallType: () => request('/stream/call-type', {
        method: 'POST',
    }),
}
