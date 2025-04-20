import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./web/lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
