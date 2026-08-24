import express from 'express';
import malogg from 'malogg';
import dotenv from 'dotenv';
import connectDb from './config/db.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 8080

app.use(malogg)
app.get('/health',(req,res)=>{
    res.status(200).json({
        "message":"Server health checked"
    })
})

connectDb()

app.listen(PORT,()=>{
    console.log("Server running on port", PORT)
})