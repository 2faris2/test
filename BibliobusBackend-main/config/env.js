import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("1h"), // opcionalno, npr. '1h', '7d'
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
