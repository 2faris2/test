import { z } from "zod";
export const createBookSchema = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().min(10).max(13),
    genre: z.string().optional(),
    description: z.string().optional(),
    coverImage: z.string().url().optional(),
    available: z.boolean().default(true),
    location: z.string().optional(),
});
export const updateBookSchema = createBookSchema.partial();
