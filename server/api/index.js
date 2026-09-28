import app from "../src/app.js";
import initDb from "../src/config/initDb.js";

export default async function handler(req, res) {
    try {
        await initDb();
    } catch (err) {
        console.error("Database connection failed in serverless function:", err);
    }
    return app(req, res);
}
