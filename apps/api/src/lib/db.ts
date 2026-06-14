/**
 * Mongoose connection helper.
 * connectDb() is lazy and non-fatal: if MONGODB_URI is absent it logs a
 * warning and resolves without connecting, so /health and /docs still work.
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';

let connected = false;

export async function connectDb(): Promise<void> {
  if (!env.MONGODB_URI) {
    console.warn('[db] Skipping DB connection — MONGODB_URI not configured');
    return;
  }

  if (connected) return;

  try {
    mongoose.set('strict', true);
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGODB_URI, {
      // Mongoose 8 defaults are already sensible; tweak as needed
      serverSelectionTimeoutMS: 5000,
    });

    connected = true;
    console.info('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] Connection failed:', err);
    // Non-fatal — the app continues running without DB
  }
}

/**
 * Returns the underlying native Db instance for adapters that need it
 * (e.g. better-auth mongodbAdapter).  May be undefined if not connected.
 */
export function getNativeDb(): mongoose.mongo.Db | undefined {
  return mongoose.connection.db;
}

/**
 * Mongoose toJSON transform applied globally.
 * Maps _id → id, removes __v so documents serialise to the shared types.
 */
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(_doc: unknown, ret: Record<string, unknown>) {
      ret['id'] = ret['_id'];
      delete ret['_id'];
      delete ret['__v'];
      return ret;
    },
  });
});
