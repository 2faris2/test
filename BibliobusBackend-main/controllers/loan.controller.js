import { prisma } from "../utils/prisma.js";
// Loan Controller
export const loanController = {
    // Checkout a book
    create: async (req, res) => {
        try {
            const { userId, bookId, dueDate } = req.body;
            if (!userId || !bookId || !dueDate) {
                return res.status(400).json({ message: "All fields are required" });
            }
            // Check if book exists and is available
            const book = await prisma.book.findUnique({ where: { id: bookId } });
            if (!book)
                return res.status(404).json({ message: "Book not found" });
            if (!book.available)
                return res.status(400).json({ message: "Book not available" });
            // Create loan
            const loan = await prisma.loan.create({
                data: {
                    userId,
                    bookId,
                    dueDate: new Date(dueDate),
                },
            });
            // Mark book as unavailable
            await prisma.book.update({
                where: { id: bookId },
                data: { available: false },
            });
            res.status(201).json({ message: "Book checked out", loan });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to create loan", error });
        }
    },
    // List loans
    list: async (req, res) => {
        try {
            const where = req.user?.role === "MEMBER" ? { userId: req.user.id } : {};
            const loans = await prisma.loan.findMany({
                where,
                include: {
                    book: true,
                    user: true,
                    Delivery: true,
                },
            });
            res.json(loans);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch loans", error });
        }
    },
    // Return book
    returnBook: async (req, res) => {
        try {
            const { id } = req.params;
            const loan = await prisma.loan.findUnique({ where: { id } });
            if (!loan)
                return res.status(404).json({ message: "Loan not found" });
            if (loan.returned)
                return res.status(400).json({ message: "Book already returned" });
            // Mark loan as returned
            const updatedLoan = await prisma.loan.update({
                where: { id },
                data: { returned: true },
            });
            // Mark book as available again
            await prisma.book.update({
                where: { id: loan.bookId },
                data: { available: true },
            });
            res.json({ message: "Book returned successfully", loan: updatedLoan });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to return book", error });
        }
    },
};
