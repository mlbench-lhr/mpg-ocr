import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// API route to save or update the DB connection details
export async function POST(req: NextRequest) {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const userId = decoded.id;

    // Get the database connection details from the request body
    const body = await req.json();
    const { systemID, userName, password, ipAddress, portNumber, serviceName } = body;

    // Validate the fields
    if (!systemID || !userName || !password || !ipAddress || !portNumber || !serviceName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db("my-next-app"); // Replace with your database name
    const connectionsCollection = db.collection("db_connections");

    // Check if a connection already exists for the given userId and systemID
    const existingConnection = await connectionsCollection.findOne({
      userId: new ObjectId(userId)
    });

    if (existingConnection) {
      // Update the existing connection if it exists
      const result = await connectionsCollection.updateOne(
        { _id: existingConnection._id }, // Find by existing connection ID
        {
          $set: {
            systemID,
            userName,
            password,
            ipAddress,
            portNumber,
            serviceName,
            updatedAt: new Date(), // Track the update timestamp
          },
        }
      );

      return NextResponse.json({
        message: "Database connection updated successfully!",
        data: result,
      }, { status: 200 });
    } else {
      // Insert a new connection if it doesn't exist
      const result = await connectionsCollection.insertOne({
        userId: new ObjectId(userId),
        systemID,
        userName,
        password,
        ipAddress,
        portNumber,
        serviceName,
        createdAt: new Date(),
      });

      return NextResponse.json({
        message: "Database connection saved successfully!",
        data: result,
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving or updating DB connection:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
