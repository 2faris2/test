import { z } from "zod";
import { NotificationTypeSchema } from "./shared.schema.js";
export const NotificationSchema = z.object({
    id: z.string().cuid(),
    userId: z.string(),
    type: NotificationTypeSchema,
    message: z.string(),
    read: z.boolean().default(false),
    createdAt: z.date().default(() => new Date()),
});
