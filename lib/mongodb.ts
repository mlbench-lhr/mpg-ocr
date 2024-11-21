import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
// const options = {};
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    tls: true, // Enforce TLS connection
    tlsAllowInvalidCertificates: false, // Reject invalid certificates
  };
  

let clientPromise: Promise<MongoClient>;

/* eslint-disable no-var */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
/* eslint-enable no-var */

// Log the attempt to connect to MongoDB
console.log("Attempting to connect to MongoDB...");

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
// Log the successful connection or failure
clientPromise
  .then(() => console.log("MongoDB connection successful"))
  .catch((error) => console.log("MongoDB connection error:", error));
export default clientPromise;
