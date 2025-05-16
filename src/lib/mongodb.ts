import mongoose from 'mongoose';

// MongoDB connection URI - store this in .env in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/steam_market_monitor';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let isConnected = false;

export async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 