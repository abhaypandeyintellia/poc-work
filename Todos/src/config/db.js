import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully");
        
    } catch (error) {
        console.log(error.message);
        
    }
}