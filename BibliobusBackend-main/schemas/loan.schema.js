import { z } from "zod";
export const LoanSchema = z.object({
    id: z.string().cuid(),
    userId: z.string(),
    bookId: z.string(),
    dueDate: z.date(),
    returned: z.boolean().default(false),
    comment: z.string().nullable().optional(),
    createdAt: z.date().default(() => new Date()),
});
