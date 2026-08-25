import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UserModel } from '../models/user.model.js'

dotenv.config()

const isLoggedIn = async (req: any, res: any, next: any): Promise<void> => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user: { _id: string } }
        const user = await UserModel.findById(decoded.user._id)
        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized' })
            return
        }
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

export { isLoggedIn }
