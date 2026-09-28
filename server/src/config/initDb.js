import mongoose from "mongoose";

const initDb = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected successfully ✅");
    } catch (error) {
        console.error("MongoDB Connection failed: ", error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    }
};

export default initDb;