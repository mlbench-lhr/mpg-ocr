import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Use a global variable to prevent creating multiple instances
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, always create a new MongoClient instance
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
