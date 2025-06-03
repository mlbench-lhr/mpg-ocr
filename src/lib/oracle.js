// import oracledb from "oracledb";

// /**
//  * Get OracleDB Connection with dynamic credentials
//  */
// export async function getOracleConnection(userName, password, ipAddress, portNumber, serviceName) {
//   try {
//     const connection = await oracledb.getConnection({
//       user: userName,
//       password: password,
//       connectString: `${ipAddress}:${portNumber}/${serviceName}`,
//     });

//     console.log("✅ Connected to OracleDB");
//     return connection;
//   } catch (error) {
//     console.error("❌ OracleDB Connection Failed:", error.message);
//     throw error;
//   }
// }



/**
 * Get OracleDB Connection with dynamic credentials
 */
// export async function getOracleConnection(userName, password, ipAddress, portNumber, serviceName) {
//     const dbResponse = await fetch("http://localhost:3000/api/auth/public-db");
//     const dbData = await dbResponse.json();

//     console.log('dbData?.database -> ', dbData)
//     if (dbData?.database !== "remote") {
//       console.log("Database is not remote. Skipping job execution.");
//       return;
//     }
//   try {
//     const connection = await oracledb.getConnection({
//       user: userName,
//       password: password,
//       connectString: `${ipAddress}:${portNumber}/${serviceName}`,
//     });

//     console.log("✅ Connected to OracleDB");
//     return connection;
//   } catch (error) {
//     console.error("❌ OracleDB Connection Failed:", error.message);
//     throw error;
//   }
// }
import oracledb from "oracledb";


export async function getOracleConnection(userName, password, ipAddress, portNumber, serviceName) {
  try {
    const dbResponse = await fetch("http://localhost:3000/api/auth/public-db");

    if (!dbResponse.ok) {
      console.error("Failed to fetch database info.");
      return null;
    }

    const dbData = await dbResponse.json();
    const dbType = dbData?.database;

    // console.log("Database type =>", dbType);

    if (dbType !== "remote") {
      console.log("Database is not remote. Skipping OracleDB connection.");
      return null;
    }

    const connection = await oracledb.getConnection({
      user: userName,
      password: password,
      connectString: `${ipAddress}:${portNumber}/${serviceName}`,
    });

    console.log("✅ Connected to OracleDB");
    return connection;

  } catch (error) {
    console.error("❌ OracleDB Connection Failed:", error.message);
    throw error;
  }
}

// import oracledb from "oracledb";
// import clientPromise from "./mongodb";
// import { ObjectId } from "mongodb";

// const DB_NAME = process.env.DB_NAME || "my-next-app";


// export async function getOracleConnection(userName, password, ipAddress, portNumber, serviceName, userId) {
//   try {
//     const dbResponse = await fetch("http://localhost:3000/api/auth/public-db");

//     if (!dbResponse.ok) {
//       console.error("Failed to fetch database info.");
//       return null;
//     }

//     const dbData = await dbResponse.json();
//     const dbType = dbData?.database;

//     if (dbType !== "remote") {
//       console.log("Database is not remote. Skipping OracleDB connection.");
//       return null;
//     }

//     const connection = await oracledb.getConnection({
//       user: userName,
//       password: password,
//       connectString: `${ipAddress}:${portNumber}/${serviceName}`,
//     });

//     console.log("✅ Connected to OracleDB");
//     return connection;

//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";

//     // Store log message in MongoDB
//     try {
//       const client = await clientPromise;
//       const db = client.db(DB_NAME);
//       const connectionsCollection = db.collection("db_connections");

//       const userObjId = new ObjectId(userId); // make sure userId is passed and valid

//       const logMessage = `OracleDB connection failed: ${errorMessage}`;

//       await connectionsCollection.updateOne(
//         { userId: userObjId },
//         {
//           $set: {
//             logMessage,
//             updatedAt: new Date(),
//           },
//         },
//         { upsert: true }
//       );
//     } catch (dbError) {
//       console.error("Failed to save OracleDB connection log:", dbError);
//     }

//     console.error("❌ OracleDB Connection Failed:", errorMessage);
//     throw error; // rethrow if you want to handle it upstream
//   }
// }

