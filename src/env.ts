import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  API_TOKEN: z.string().default("zns-secret-token-2025"),
  WEBHOOK_RETIRED_URL: z.string().url().optional(),
  WEBHOOK_ATHLETES_RIGHTS_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
