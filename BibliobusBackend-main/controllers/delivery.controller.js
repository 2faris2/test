import { prisma } from "../utils/prisma.js";
export const deliveryController = {
    list: async (req, res) => {
        try {
            let deliveries;
            if (req.user?.role === "DRIVER") {
                // Driver vidi samo svoje deliveries
                deliveries = await prisma.delivery.findMany({
                    where: { driverId: req.user.id },
                });
            }
            else {
                // Admin vidi sve
                deliveries = await prisma.delivery.findMany();
            }
            res.json(deliveries);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to fetch deliveries", error: err });
        }
    },
    create: async (req, res) => {
        try {
            const { loanId, driverId } = req.body;
            if (!loanId) {
                return res.status(400).json({ message: "Loan ID is required" });
            }
            const delivery = await prisma.delivery.create({
                data: {
                    loanId,
                    driverId: driverId || null,
                },
            });
            res.status(201).json(delivery);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to create delivery", error: err });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, photoUrl } = req.body;
            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }
            const delivery = await prisma.delivery.update({
                where: { id },
                data: { status, photoUrl },
            });
            res.json(delivery);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to update delivery", error: err });
        }
    },
};
