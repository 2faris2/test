import { prisma } from "../utils/prisma.js";
export const busStopController = {
    list: async (req, res) => {
        try {
            const stops = await prisma.busStop.findMany();
            res.json(stops);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to fetch bus stops", error: err });
        }
    },
    create: async (req, res) => {
        try {
            const { name, location } = req.body;
            if (!name || !location) {
                return res
                    .status(400)
                    .json({ message: "Name and location are required" });
            }
            const stop = await prisma.busStop.create({
                data: { name, location },
            });
            res.status(201).json(stop);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to create bus stop", error: err });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, location } = req.body;
            if (!name && !location) {
                return res
                    .status(400)
                    .json({
                    message: "At least one field (name or location) is required",
                });
            }
            const stop = await prisma.busStop.update({
                where: { id },
                data: { name, location },
            });
            res.json(stop);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to update bus stop", error: err });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.busStop.delete({ where: { id } });
            res.json({ message: "Bus stop deleted" });
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to delete bus stop", error: err });
        }
    },
};
