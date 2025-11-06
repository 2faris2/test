import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { generateToken } from "../utils/jwt.util.js";
export const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, phone, role } = req.body;
            // Provjeri da li već postoji korisnik
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
            // Hashiraj password
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role,
                },
            });
            const token = generateToken({ id: user.id, role: user.role });
            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Registration failed", error });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const token = generateToken({ id: user.id, role: user.role });
            res.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Login failed", error });
        }
    },
    me: async (req, res) => {
        try {
            console.log("Fetching user info for user:", req);
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, name: true, email: true, role: true, phone: true },
            });
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch user info", error });
        }
    },
};
