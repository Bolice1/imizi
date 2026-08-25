import { UserModel } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import emailUtils from '../utils/email.js'
import crypto from 'crypto'

dotenv.config();

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body
    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "fullName, email and password are all required"
        })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.insertOne({
            fullName,
            email,
            password: hashedPassword
        })
        const host = req.get('host');
        const protocol = req.secure || req.headers['x-forwarded-proto'] == "https"?"https":"http";
        const loginUrl = `${protocol}://${host}/login`
        
        emailUtils.sendWelcomeEmail(fullName,loginUrl,email).then(()=>{
            return res.status(201).json({
                success: true,
                message: "User registered"
            })

        })
    } catch (error) {
        console.log(error.message)
    }
}

const logIn = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "email and password are all required"
        })
    }

    try {
        const user = await UserModel.findOne({ email }).select("+password");
        const userToReturn =await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (!await bcrypt.compare(password, user.password))
            return res.status(400).json({
                success:false,
                message:"Incorrect password"
            })

        const token = jwt.sign(
            {user},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        )

        res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:userToReturn
        })
    } catch (error) {
        res.status(500).json({
            message:"Internal server error"
        })
        console.log(error.message)
    }
}

const forgotPassword = async(req,res,next)=>{
    const email = req.body.email;
    if(!email){
        return res.status(400).json({
            success:false,
            message:"Email is required"
        })
    }

    try {
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"no user with that email"
            })
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken
        user.resetTokenExpires = Date.now() + ( 30 * 60 * 1000)
        await user.save()

        const host = req.get('host');
        const protocol = req.secure || req.headers['x-forwarded-proto'] == "https"?"https":"http";
        const resetUrl = `${protocol}://${host}/reset-password/${resetToken}?email=${email}`;
        emailUtils.sendResetPasswordEmail(user.fullName,email,resetUrl).then(()=>{
            res.status(200).json({
                success:true,
                message:"Reset Link has been sent to your email"
            })
        })
        
    } catch (error) {
        console.log(error.message)
    }
}


const restPassword = async (req,res,next)=>{
    const resetToken = req.params.resetToken;
    const email = req.query.email
    const newPassword = req.body.password
    if(!resetToken || !email){
        return res.status(400).json({
            success:false,
            message:"no reset token in the reset link"
        })
    }

    const user = await UserModel.findOne({email});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid reset link"
        })
    }
    const newHashedPassword = await bcrypt.hash(newPassword,10)

    try {
        if(!(resetToken == user.resetToken)){
            return res.status(400).json({
                success:false,
                message:"Tokens don't match"
            })
        }

        if(user.resetTokenExpires < Date.now()){
            return res.status(400).json({
                success:false,
                message:"The resent link has expired"
            })
        }

        user.password = newHashedPassword
        user.resetToken = undefined;
        user.resetTokenExpires = undefined
        await user.save()

        res.status(200).json({
            success:true,
            message:"Your password has been reset successfully"
        })

    } catch (error) {
        console.log(error.message)
    }


}


export default {
    register,
    logIn,
    forgotPassword,
    restPassword
}