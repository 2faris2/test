import { prisma } from "../utils/prisma.js";
export const notificationController = {
    // List user's notifications
    list: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const notifications = await prisma.notification.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: "desc" },
            });
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch notifications", error });
        }
    },
    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const { id } = req.params;
            const notification = await prisma.notification.findUnique({
                where: { id },
            });
            if (!notification)
                return res.status(404).json({ message: "Notification not found" });
            if (notification.userId !== req.user.id)
                return res.status(403).json({ message: "Forbidden" });
            const updatedNotification = await prisma.notification.update({
                where: { id },
                data: { read: true },
            });
            res.json({
                message: "Notification marked as read",
                notification: updatedNotification,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update notification", error });
        }
    },
};
