import app from "../src/app.js";
import initDb from "../src/config/initDb.js";

await initDb();

export default app;