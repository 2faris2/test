import { z } from "zod";
import { DayOfWeekSchema } from "./shared.schema.js";
export const BusRouteSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    dayOfWeek: DayOfWeekSchema,
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
