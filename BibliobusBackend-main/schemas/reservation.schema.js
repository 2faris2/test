import { z } from "zod";
import { ReservationStatusSchema } from "./shared.schema.js";
export const ReservationSchema = z.object({
    id: z.string().cuid(),
    userId: z.string(),
    bookId: z.string(),
    status: ReservationStatusSchema.default("PENDING"),
    createdAt: z.date().default(() => new Date()),
});
