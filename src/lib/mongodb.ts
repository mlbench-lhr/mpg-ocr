import { MongoClient } from "mongodb";

// Check if MONGODB_URI is defined
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Handle connection reuse based on the environment
if (process.env.NODE_ENV === "development") {
  // Use a global variable in development to prevent reinitializing the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // Optional: Adjust timeout as needed
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Create a new client instance for production
  client = new MongoClient(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000, // Optional: Adjust timeout as needed
  });
  clientPromise = client.connect();
}

export default clientPromise;
