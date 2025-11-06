import { prisma } from "../utils/prisma.js";
export const bookController = {
    list: async (req, res) => {
        try {
            const { search } = req.query;
            const books = await prisma.book.findMany({
                where: search
                    ? {
                        OR: [
                            { title: { contains: String(search), mode: "insensitive" } },
                            { author: { contains: String(search), mode: "insensitive" } },
                        ],
                    }
                    : {},
            });
            res.json(books);
        }
        catch (err) {
            res.status(500).json({ message: "Failed to list books", error: err });
        }
    },
    details: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await prisma.book.findUnique({ where: { id } });
            if (!book)
                return res.status(404).json({ message: "Book not found" });
            res.json(book);
        }
        catch (err) {
            res
                .status(500)
                .json({ message: "Failed to get book details", error: err });
        }
    },
    create: async (req, res) => {
        try {
            const data = req.body;
            console.log(data);
            if (!data.title || !data.author || !data.isbn) {
                return res
                    .status(400)
                    .json({ message: "Title, author, and ISBN are required" });
            }
            const book = await prisma.book.create({ data });
            res.status(201).json(book);
        }
        catch (err) {
            res.status(500).json({ message: "Failed to create book", error: err });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            if (Object.keys(data).length === 0) {
                return res.status(400).json({ message: "No data provided for update" });
            }
            const book = await prisma.book.update({ where: { id }, data });
            res.json(book);
        }
        catch (err) {
            res.status(500).json({ message: "Failed to update book", error: err });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.book.delete({ where: { id } });
            res.json({ message: "Book deleted" });
        }
        catch (err) {
            res.status(500).json({ message: "Failed to delete book", error: err });
        }
    },
};
