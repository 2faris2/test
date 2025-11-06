import { z } from "zod";
export const BusStopSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    location: z.string(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
