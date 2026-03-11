// testConnection.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log("Connecting to MongoDB...");

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    return mongoose.connection.close();
  })
  .then(() => {
    console.log("🔌 Connection closed.");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
