import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "production", "test"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  API_TOKEN: z.string().default("zns-secret-token-2025"),
  WEBHOOK_RETIRED_URL: z.string().url(),
  WEBHOOK_ATHLETES_RIGHTS_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables: ", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
