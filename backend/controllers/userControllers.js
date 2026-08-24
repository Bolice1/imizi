import { UserModel } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';

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
        return res.status(201).json({
            success: true,
            message: "User registered"
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




export default {
    register,
    logIn

}