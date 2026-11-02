const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;
  const primaryUri = process.env.MONGODB_URI;
  const localUri = process.env.MONGODB_LOCAL_URI || "mongodb://127.0.0.1:27017/club_recruitment";

  // 1. Attempt connection to primary URI (Cloud Atlas)
  if (primaryUri) {
    try {
      console.log("Connecting to primary MongoDB URI...");
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("MongoDB connected successfully to primary cloud database!");
      isConnecting = false;
      return;
    } catch (error) {
      console.warn(`Primary MongoDB connection failed (${error.message}).`);
    }
  }

  // 2. Attempt fallback to local MongoDB if primary is remote
  if (primaryUri && !primaryUri.includes("127.0.0.1") && !primaryUri.includes("localhost")) {
    console.log(`Attempting fallback to local MongoDB (${localUri})...`);
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log("MongoDB connected successfully to local MongoDB fallback!");
      isConnecting = false;
      return;
    } catch (localError) {
      console.warn(`Local MongoDB fallback failed (${localError.message}).`);
    }
  }

  isConnecting = false;
  throw new Error(
    "Unable to establish a connection to MongoDB. If developing locally, start MongoDB with: brew services start mongodb-community"
  );
};

module.exports = connectDB;
