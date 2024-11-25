import { NextResponse } from "next/server";
import oracledb from "oracledb";

// Replace with your Oracle DB connection details
const dbConfig = {
  user: "your-username",  // e.g., "admin"
  password: "your-password",  // e.g., "password"
  connectString: "your-db-host:port/your-service-name"  // e.g., "localhost:1521/XE"
};

export async function GET() {
  try {
    // Attempt to check DB connection
    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
      return NextResponse.json({ dbConnected: true });
    } else {
      return NextResponse.json({ dbConnected: false });
    }
  } catch (error) {
    console.error("DB Connection error:", error);
    return NextResponse.json({ dbConnected: false });
  }
}

async function checkDbConnection() {
  try {
    // Try to connect to the Oracle DB
    const connection = await oracledb.getConnection(dbConfig);

    // If connected successfully, close the connection
    await connection.close();
    return true;
  } catch (error) {
    console.error("Oracle DB connection failed:", error);
    return false;
  }
}
