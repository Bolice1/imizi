import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import malogg from 'malogg'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import connectDb from './config/db.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
app.use(malogg)
app.use('/api/v1', routes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: 'File is too large. Maximum size is 50MB.' })
        return
    }
    console.log((err as Error)?.message)
    res.status(500).json({ success: false, message: err?.message || 'Something went wrong' })
})

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server health checked'
    })
})

app.get('/reset-password/:token', (req: Request, res: Response) => {
    const { token } = req.params
    const email = typeof req.query.email === 'string' ? req.query.email : undefined
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (token) params.set('token', token as string)
    if (email) params.set('email', email)
    res.redirect(`${frontendUrl}/reset-password?${params.toString()}`)
})

connectDb()

app.listen(PORT, () => {
    console.log('Server running on port', PORT)
})
