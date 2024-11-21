import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // In development, use a global variable so the MongoClient is not constantly recreated.
    if (!(globalThis as any)._mongoClientPromise) {
        client = new MongoClient(uri, options);
        (globalThis as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (globalThis as any)._mongoClientPromise;
} else {
    // In production, it's safe to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
