import { MongoClient, MongoClientOptions } from 'mongodb';

interface CustomMongoClientOptions extends MongoClientOptions {
  autoSelectFamily?: boolean;
  ssl?: boolean;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const client = new MongoClient(uri, {
  autoSelectFamily: true,
  ssl: true,
} as CustomMongoClientOptions);

async function connectMongoDB() {
  try {
    await client.connect();
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection failed', error);
    throw error;
  }
}

export default connectMongoDB;
