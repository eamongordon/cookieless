import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();
const connectionString = process.env.DATABASE_URL!;
const pool = postgres(connectionString)

export const db = drizzle(pool, { schema });

// Gracefully close the database connection pool
const closePool = async () => {
  try {
    await pool.end(); // Close the connection pool
    console.log("Database connection pool closed.");
  } catch (error) {
    console.error("Error closing the database connection pool:", error);
  }
};

// Listen for termination signals
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing database connection...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing database connection...");
  await closePool();
  process.exit(0);
});