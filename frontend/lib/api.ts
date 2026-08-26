const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "")

export class ApiError extends Error {
    status: number
    data: any
    constructor(message: string, status: number, data?: any) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers = new Headers({
        'Content-Type': 'application/json',
    })

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${API_BASE}${path}`

    let res: Response
    try {
        res = await fetch(url, {
            ...options,
            headers,
        })
    } catch {
        throw new ApiError(`Failed to reach the API at ${API_BASE}. Is the backend running?`, 0)
    }

    let data: any = null
    try {
        data = await res.json()
    } catch {
        const text = await res.text().catch(() => '')
        data = { message: text }
    }

    if (!res.ok) {
        throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data)
    }

    return data
}

export const api = {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, data: unknown) => request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    put: (endpoint: string, data: unknown) => request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (endpoint: string) => request(endpoint, {
        method: 'DELETE',
    }),
}
