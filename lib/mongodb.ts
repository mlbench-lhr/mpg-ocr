import { MongoClient, MongoClientOptions } from 'mongodb';

// Extend MongoClientOptions to include the custom options
interface CustomMongoClientOptions extends MongoClientOptions {
    autoSelectFamily?: boolean;
    ssl?: boolean;            // SSL option to handle SSL connections
}

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
}

// Ensure the connection string itself has the correct SSL options
// Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority&ssl=true

const client = new MongoClient(uri, {
    autoSelectFamily: true,   // Automatically select between IPv4 and IPv6
    ssl: true,                // Enable SSL for secure connection
} as CustomMongoClientOptions);

async function connectMongoDB() {
    try {
        await client.connect();
        console.log('MongoDB connected successfully');
        return client;  // Return the client object so it can be used elsewhere
    } catch (error) {
        console.error('MongoDB connection failed', error);
        throw error;
    }
}

// Export the connection function
export default connectMongoDB;
