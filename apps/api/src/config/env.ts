import { z } from "zod";
import fs from "fs";
import path from "path";

try {
  const apiEnvPath = path.resolve(process.cwd(), "apps/api/.env");
  if (fs.existsSync(apiEnvPath)) {
    process.loadEnvFile(apiEnvPath);
  } else if (fs.existsSync(".env")) {
    process.loadEnvFile(".env");
  }
} catch {}

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Supabase
  SUPABASE_URL: z.string().url().default("https://vbesyjbxclatvsqypnmc.supabase.co"),
  SUPABASE_ANON_KEY: z.string().min(1).default("sb_publishable_ObScrj8Oz5kFVAF8lxd7eg_hTbmermj"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default("sb_secret_SMwlvBT2qEGmqjgO1BQq7Q_B3QXTTte"),

  // Database
  DATABASE_URL: z.string().min(1).default("postgresql://postgres.vbesyjbxclatvsqypnmc:HZfj3z943pQqLJ6N@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1).default("dummy-cloud"),
  CLOUDINARY_API_KEY: z.string().min(1).default("123456789"),
  CLOUDINARY_API_SECRET: z.string().min(1).default("dummy-secret"),

  // CORS
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
