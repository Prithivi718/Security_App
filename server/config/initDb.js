import mongoose from "mongoose";

const initDb = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected successfully ✅");
    } catch(error){
        console.error("MongoDB Connection failed: ", error.message);
        process.exit(1);
    }
};

export default initDb;