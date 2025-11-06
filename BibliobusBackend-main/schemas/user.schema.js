import { z } from "zod";
// ✅ Register schema (samo osnovni podaci koje user sam unosi)
export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
});
// ✅ Login schema
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is required"),
});
// ✅ Admin/Librarian kreira usera
export const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "LIBRARIAN", "DRIVER", "MEMBER"]).default("MEMBER"),
    qrCode: z.string().optional(),
    activeUntil: z.string().datetime().optional(),
    booksLimit: z.number().default(3),
    finesOwed: z.number().default(0),
});
// ✅ Update schema (partial)
export const updateUserSchema = createUserSchema.partial();
