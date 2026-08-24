import mongoose  from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();

const connectDb = ()=>{

    if(!process.env.MONGO_URI){
        console.log("MONGO_URI Not set");
        return;
    }

    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo db connected successfully ",process.env.MONGO_URI)
    } catch (error) {
        console.log(error.message)
    }

}

export default connectDb

