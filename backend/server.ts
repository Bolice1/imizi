import express, { Request, Response } from 'express'
import malogg from 'malogg'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import connectDb from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(malogg)
app.use('/api/v1', routes)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Server health checked'
    })
})

connectDb()

app.listen(PORT, () => {
    console.log('Server running on port', PORT)
})
