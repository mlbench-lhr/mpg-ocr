// lib/mongodb.ts

import { MongoClient, MongoClientOptions } from 'mongodb';

// Extend MongoClientOptions to include the custom options
interface CustomMongoClientOptions extends MongoClientOptions {
    autoSelectFamily?: boolean;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
}

// Use the extended options without autoSelectFamilyTimeout
const client = new MongoClient(uri, {
    autoSelectFamily: true, // Automatically select between IPv4 and IPv6
} as CustomMongoClientOptions);

async function connectMongoDB() {
    try {
        await client.connect();
        console.log('MongoDB connected successfully');
        return client; // Return the client object so it can be used elsewhere
    } catch (error) {
        console.error('MongoDB connection failed', error);
        throw error;
    }
}

// Export the connection function
export default connectMongoDB;
