import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DATABASE_URL!;
const pool = postgres(connectionString)
 
export const db = drizzle(pool)