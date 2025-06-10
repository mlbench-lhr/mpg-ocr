// /app/api/oracle-logs/route.ts or /pages/api/oracle-logs.ts (depending on your Next.js version)

import clientPromise from "@/lib/mongodb";
import { getOracleConnection } from "@/lib/oracle";
import { NextResponse } from "next/server";
import oracledb from "oracledb";
interface TotalRow {
  TOTAL: number;
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("my-next-app");
    const connectionsCollection = db.collection("db_connections");
    const userDBCredentials = await connectionsCollection.findOne(
      {},
      { sort: { _id: -1 } }
    );
    if (!userDBCredentials) {
      return NextResponse.json(
        { message: "OracleDB credentials not found" },
        { status: 404 }
      );
    }

    const { userName, password, ipAddress, portNumber, serviceName } =
      userDBCredentials;
    const connection = await getOracleConnection(
      userName,
      password,
      ipAddress,
      portNumber,
      serviceName
    );

    if (!connection) {
      return NextResponse.json(
        { error: "Failed to establish OracleDB connection" },
        { status: 500 }
      );
    }
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const search = url.searchParams.get("search")?.toUpperCase() || "";
    const offset = (page - 1) * limit;

    const totalResult = await connection.execute<TotalRow>(
      `SELECT COUNT(*) AS TOTAL FROM ${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T WHERE FILE_ID LIKE :search COLLATE BINARY_CI`,
      [`%${search}%`],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalRows = totalResult.rows?.[0]?.TOTAL ?? 0;

    const result = await connection.execute(
      `
  SELECT *
  FROM (
    SELECT a.*, ROWNUM rnum
    FROM (
      SELECT * FROM  ${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T
      WHERE UPPER(FILE_ID) LIKE :search COLLATE BINARY_CI
      ORDER BY CRTD_DTT DESC
    ) a
    WHERE ROWNUM <= :maxRow
  )
  WHERE rnum > :offset
  `,
      {
        search: `%${search}%`,
        maxRow: offset + limit,
        offset,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    return NextResponse.json({
      data: result.rows || [],
      total: totalRows,
      page,
      totalPages: Math.ceil(totalRows / limit),
    });
  } catch (error) {
    console.error("Error fetching Oracle logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch Oracle logs." },
      { status: 500 }
    );
  }
}
