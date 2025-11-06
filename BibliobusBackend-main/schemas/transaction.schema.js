import { z } from "zod";
import { TransactionTypeSchema } from "./shared.schema.js";
export const TransactionSchema = z.object({
    id: z.string().cuid(),
    userId: z.string(),
    amount: z.number(),
    type: TransactionTypeSchema,
    createdAt: z.date().default(() => new Date()),
});
