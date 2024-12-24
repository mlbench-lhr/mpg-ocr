// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { ObjectId } from "mongodb";
// import clientPromise from "@/lib/mongodb";

// const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET as string;

// export async function POST(req: NextRequest) {
//   try {
//     const token = req.headers.get("Authorization")?.split(" ")[1];
//     if (!token) {
//       return NextResponse.json({ message: "Authentication required" }, { status: 401 });
//     }

//     const { id: userId } = jwt.verify(token, SECRET_KEY) as { id: string };

//     const { systemID, userName, password, ipAddress, portNumber, serviceName } = await req.json();

//     if (!systemID || !userName || !password || !ipAddress || !portNumber || !serviceName) {
//       return NextResponse.json({ message: "All fields are required" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db("my-next-app");
//     const connectionsCollection = db.collection("db_connections");

//     const existingConnection = await connectionsCollection.findOne({ userId: new ObjectId(userId) });

//     if (existingConnection) {
//       const result = await connectionsCollection.updateOne(
//         { _id: existingConnection._id },
//         {
//           $set: {
//             systemID,
//             userName,
//             password,
//             ipAddress,
//             portNumber,
//             serviceName,
//             updatedAt: new Date(),
//           },
//         }
//       );

//       return NextResponse.json(
//         { message: "Database connection updated successfully!", data: result },
//         { status: 200 }
//       );
//     }

//     const result = await connectionsCollection.insertOne({
//       userId: new ObjectId(userId),
//       systemID,
//       userName,
//       password,
//       ipAddress,
//       portNumber,
//       serviceName,
//       createdAt: new Date(),
//     });

//     return NextResponse.json(
//       { message: "Database connection saved successfully!", data: result },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("Error saving/updating DB connection:", error);
//     return NextResponse.json(
//       { message: "An error occurred while connecting to your DB. Please try again." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.headers.get("Authorization")?.split(" ")[1];
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     const { id: userId } = jwt.verify(token, SECRET_KEY) as { id: string };

//     const client = await clientPromise;
//     const db = client.db("my-next-app");
//     const connectionsCollection = db.collection("db_connections");

//     const connection = await connectionsCollection.findOne({ userId: new ObjectId(userId) });

//     if (!connection) {
//       return NextResponse.json(
//         { success: false, message: "No data found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, data: connection }, { status: 200 });
//   } catch (error) {
//     console.log("Error fetching connection:", error);
//     return NextResponse.json(
//       { success: false, message: "An error occurred" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
// import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

const SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const { id: userId } = jwt.verify(token, SECRET_KEY) as { id: string };

    const { systemID, userName, password, ipAddress, portNumber, serviceName } = await req.json();
    if (!systemID || !userName || !password || !ipAddress || !portNumber || !serviceName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const connectionsCollection = db.collection("db_connections");

    const userObjId = new ObjectId(userId);

    // const encryptedPassword = await bcrypt.hash(password, 10);

    const result = await connectionsCollection.updateOne(
      { userId: userObjId },
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
      },
      { upsert: true }
    );

    const message = result.upsertedCount
      ? "Database connection saved successfully!"
      : "Database connection updated successfully!";

    return NextResponse.json({ message, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error saving/updating DB connection:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: userId } = jwt.verify(token, SECRET_KEY) as { id: string };

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const connectionsCollection = db.collection("db_connections");

    const connection = await connectionsCollection.findOne(
      { userId: new ObjectId(userId) }
    );

    if (!connection) {
      return NextResponse.json(
        { success: false, message: "No data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: connection }, { status: 200 });
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
