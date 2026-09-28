import app from "./src/app.js";
import initDb from "./src/config/initDb.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT} 🚀`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
};

startServer();