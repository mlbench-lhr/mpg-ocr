import { MongoClient } from 'mongodb';

// Ensure that the MONGODB_URI environment variable is not undefined
const uri: string | undefined = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Use uri to create a MongoClient instance
const client = new MongoClient(uri);

// Example function to connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Database connection error");
  }
}

export default connectToDatabase;
