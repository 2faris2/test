// utils/jwt.util.ts
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // obavezno koristi .env u produkciji
const JWT_EXPIRES_IN = "7d"; // koliko dugo token važi
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
