import { prisma } from "../utils/prisma.js";
export const reservationController = {
    // Create reservation (User)
    create: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const { bookId } = req.body;
            if (!bookId)
                return res.status(400).json({ message: "Book ID is required" });
            const reservation = await prisma.reservation.create({
                data: {
                    userId: req.user.id,
                    bookId,
                },
            });
            res.status(201).json(reservation);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to create reservation", error });
        }
    },
    // List reservations (User/Admin)
    list: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const where = req.user.role === "ADMIN" || req.user.role === "LIBRARIAN"
                ? {}
                : { userId: req.user.id };
            const reservations = await prisma.reservation.findMany({
                where,
                include: {
                    user: true,
                    book: true,
                },
                orderBy: { createdAt: "desc" },
            });
            res.json(reservations);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch reservations", error });
        }
    },
    // Update reservation status (Librarian/Admin)
    updateStatus: async (req, res) => {
        try {
            if (!req.user)
                return res.status(401).json({ message: "Unauthorized" });
            const { id } = req.params;
            const { status } = req.body;
            if (!status)
                return res.status(400).json({ message: "Status is required" });
            const reservation = await prisma.reservation.findUnique({
                where: { id },
            });
            if (!reservation)
                return res.status(404).json({ message: "Reservation not found" });
            const updatedReservation = await prisma.reservation.update({
                where: { id },
                data: { status },
            });
            res.json(updatedReservation);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update reservation", error });
        }
    },
};
