import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import memberRoutes from "./routes/friendship.routes.js";
import groupRoutes from "./routes/group.routes.js";

import chatSessionRoutes from "./routes/chatSession.routes.js";
import messageRoutes from "./routes/message.routes.js";



const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://security-app-red.vercel.app"
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");
        if (
            allowedOrigins.includes(cleanOrigin) ||
            allowedOrigins.includes(origin) ||
            process.env.NODE_ENV !== "production" ||
            (process.env.CLIENT_URL && cleanOrigin === process.env.CLIENT_URL.replace(/\/$/, "")) ||
            cleanOrigin.endsWith(".vercel.app")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/member", memberRoutes);
app.use("/api/group", groupRoutes);

app.use("/api/chat-session", chatSessionRoutes);
app.use("/api/message", messageRoutes);


export default app;