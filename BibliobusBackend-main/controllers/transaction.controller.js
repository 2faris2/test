import { prisma } from "../utils/prisma.js";
export const transactionController = {
    // List transactions (User/Admin)
    list: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
            const transactions = await prisma.transaction.findMany({
                where,
                include: { user: true },
                orderBy: { createdAt: "desc" },
            });
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch transactions", error });
        }
    },
    // Create transaction (Admin)
    create: async (req, res) => {
        try {
            if (!req.user || req.user.role !== "ADMIN") {
                return res.status(403).json({ message: "Forbidden: Admin only" });
            }
            const { userId, amount, type } = req.body;
            if (!userId || !amount || !type) {
                return res
                    .status(400)
                    .json({ message: "userId, amount, and type are required" });
            }
            const transaction = await prisma.transaction.create({
                data: { userId, amount, type },
            });
            res.status(201).json(transaction);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to create transaction", error });
        }
    },
};
