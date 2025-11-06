import { z } from "zod";
import { DeliveryStatusSchema } from "./shared.schema.js";
export const DeliverySchema = z.object({
    id: z.string().cuid(),
    loanId: z.string(),
    driverId: z.string().nullable().optional(),
    status: DeliveryStatusSchema.default("PENDING"),
    photoUrl: z.string().nullable().optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
