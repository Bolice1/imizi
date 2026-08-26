import { Request, Response, NextFunction } from 'express'
import path from 'path'

const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' })
            return
        }

        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'
        const host = req.get('host')
        const baseUrl = `${protocol}://${host}`
        const fileUrl = `${baseUrl}/uploads/${path.basename(req.file.filename)}`

        res.status(200).json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        })
    } catch (error) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: 'Failed to upload file' })
    }
}

export default {
    uploadFile
}
