import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const SALT_KEY = 'visitor_hash_salt';
const ROTATION_INTERVAL = 24 * 60 * 60; // 1 day in seconds

// Generate a new random salt
function generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// Rotate the salt if expired
export async function rotateSalt() {
    const newSalt = generateSalt();
    await redis.set(SALT_KEY, newSalt, 'EX', ROTATION_INTERVAL);
    return newSalt;
}

// Get current salt, rotate if missing
export async function getCurrentSalt() {
    let salt = await redis.get(SALT_KEY);
    if (!salt) {
        salt = await rotateSalt();
    }
    return salt;
}
