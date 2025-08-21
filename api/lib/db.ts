import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Configure Neon for Vercel deployment
if (typeof window === "undefined") {
  // Only run on server side
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with Vercel-optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optimize for serverless
  max: 1, // Single connection for serverless
  idleTimeoutMillis: 0, // Disable timeout in serverless
  connectionTimeoutMillis: 5000, // 5 second timeout
});

export const db = drizzle({ client: pool, schema });
