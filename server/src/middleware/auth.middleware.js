import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
    try {
        const token = req.cookies?.auth_token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            _id: decoded.userId,
            role: decoded.role,
            token_version: decoded.token_version ?? 0
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired authentication token"
        });
    }
};