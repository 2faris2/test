import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        console.log("User role:", req.user);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }
        next();
    };
};
