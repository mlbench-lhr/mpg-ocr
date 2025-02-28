import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET as string;
const DB_NAME = process.env.DB_NAME || "my-next-app";


// import oracledb from "oracledb";
// Define the interface for Oracle DB credentials
// interface OracleCredentials {
//   userName: string;
//   password: string;
//   ipAddress: string;
//   portNumber: number;
//   serviceName: string;
// }

// Oracle DB connection function
// async function testOracleConnection(credentials: OracleCredentials): Promise<boolean> {
//   let connection;

//   try {
//     // Connect to Oracle DB using provided credentials
//     connection = await oracledb.getConnection({
//       user: credentials.userName,
//       password: credentials.password,
//       connectString: `${credentials.ipAddress}:${credentials.portNumber}/${credentials.serviceName}`,
//     });

//     console.log("Connected to Oracle DB successfully");
//     return true; // Return true if connected successfully
//   } catch (error) {
//     console.log("Error connecting to Oracle DB:", error);
//     return false; // Return false if the connection failed
//   } finally {
//     if (connection) {
//       try {
//         await connection.close(); // Close the connection
//       } catch (err) {
//         console.log("Error closing Oracle DB connection:", err);
//       }
//     }
//   }
// }



export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const userId = decoded.id;

    const body = await req.json();
    const { systemID, userName, password, ipAddress, portNumber, serviceName } = body;

    if (!systemID || !userName || !password || !ipAddress || !portNumber || !serviceName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check Oracle DB connection
    // const isDbConnected = await testOracleConnection({ userName, password, ipAddress, portNumber, serviceName });

    // if (!isDbConnected) {
    //   return NextResponse.json({ message: "Failed to connect to Oracle DB" }, { status: 500 });
    // }

    await client.connect();
    const db = client.db(DB_NAME);
    const connectionsCollection = db.collection("db_connections");

    const existingConnection = await connectionsCollection.findOne({
      userId: new ObjectId(userId),
    });

    if (existingConnection) {
      const result = await connectionsCollection.updateOne(
        { _id: existingConnection._id },
        {
          $set: {
            systemID,
            userName,
            password,
            ipAddress,
            portNumber,
            serviceName,
            updatedAt: new Date(), 
          },
        }
      );

      return NextResponse.json({
        message: "Database connection updated successfully!",
        data: result,
      }, { status: 200 });
    } else {
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
    console.log("Error saving or updating DB connection:", error);
    return NextResponse.json({ message: "An error occurred while connecting to your DB. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const userId = decoded.id;

    await client.connect();
    const db = client.db(DB_NAME);
    const connectionsCollection = db.collection("db_connections");

    const connection = await connectionsCollection.findOne({ userId: new ObjectId(userId) });

    if (connection) {
      return NextResponse.json({ success: true, data: connection }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "No data found" }, { status: 404 });
  } catch (error) {
    console.log("Error fetching connection:", error);
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 });
  }
}

