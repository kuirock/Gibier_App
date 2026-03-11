// /lib/database.js など（クライアントからimportしない）
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI; // 例: mongodb://user:pass@192.168.1.10:27017/nextAppDataBase?authSource=admin

if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
