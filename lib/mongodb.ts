import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let clientPromise: Promise<MongoClient>;

/* eslint-disable no-var */
declare global {
  // Type declaration for a global variable to persist MongoDB connectionz
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
/* eslint-enable no-var */

if (process.env.NODE_ENV === "development") {
  // In development, we use a global variable to ensure we reuse the connection
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, directly create and connect the client without using global
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
