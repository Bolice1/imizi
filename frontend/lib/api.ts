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

async function uploadFile(endpoint: string, formData: FormData): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers = new Headers()
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
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
    upload: uploadFile,
}
