import app from "../server/src/app.js";
import initDb from "../server/src/config/initDb.js";

export default async function handler(req, res) {
    try {
        await initDb();
    } catch (err) {
        console.error("Database connection failed in serverless function:", err);
    }
    return app(req, res);
}
