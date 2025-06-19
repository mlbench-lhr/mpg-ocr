// lib/oracleJobs.ts

import { NextResponse } from "next/server";
import oracledb from "oracledb";
import clientPromise from "./mongodb";
import { getOracleConnection } from "./oracle";
import { OracleRow, PodFile } from "@/type";
import { getJobsFromMongo } from "./getJobsFromMongo";

interface MongoJob {
  _id: string;
  pdfUrl: string;
}

export async function getOracleOCRData(
  url: URL,
  skip: number,
  limit: number,
  page: number
) {
  let connection;
  try {
    const client = await clientPromise;
    const db = client.db("my-next-app");
    const connectionsCollection = db.collection("db_connections");
    const userDBCredentials = await connectionsCollection.findOne(
      {},
      { sort: { _id: -1 } }
    );

    const resultMongoDb = await getJobsFromMongo(url, skip, limit, page);
    const data = await resultMongoDb.json();
    console.log("resultMongoDb-> ", data);

    if (!userDBCredentials) {
      return NextResponse.json(
        { message: "OracleDB credentials not found" },
        { status: 404 }
      );
    }

    const { userName, password, ipAddress, portNumber, serviceName } =
      userDBCredentials;
    connection = await getOracleConnection(
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

    const podSignature =
      url.searchParams.get("podDateSignature")?.trim().toLowerCase() || "";
    const bolNumber =
      url.searchParams.get("bolNumber")?.trim().toLowerCase() || "";
    const createdDate = url.searchParams.get("createdDate") || "";
    const updatedDate = url.searchParams.get("updatedDate") || "";
    const uptd_Usr_Cd = url.searchParams.get("uptd_Usr_Cd") || "";

    const isOCR = uptd_Usr_Cd.toLowerCase() === "ocr";

    if (!isOCR) {
      const apiRes = await fetch("http://localhost:3000/api/pod/retrieve");
      const apiData: PodFile[] = await apiRes.json();
      const jobs = apiData.map((row: PodFile) => ({
        fileId: row.FILE_ID,
      }));
      return NextResponse.json(
        {
          jobs,
          totalJobs: apiData.length,
          page,
          totalPages: 1,
        },
        { status: 200 }
      );
    }

    const tableName = `${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T`;

    const whereClauses: string[] = [];
    const filterBinds: Record<string, string | Date | number> = {};

    if (uptd_Usr_Cd) {
      whereClauses.push(`LOWER(UPTD_USR_CD) = :uptd_Usr_Cd`);
      filterBinds.uptd_Usr_Cd = uptd_Usr_Cd.toLowerCase();
    }

    if (createdDate) {
      whereClauses.push(
        `TRUNC(CRTD_DTT) = TO_DATE(:createdDate, 'YYYY-MM-DD')`
      );
      filterBinds.createdDate = createdDate;
    }

    if (updatedDate) {
      whereClauses.push(
        `TRUNC(UPTD_DTT) = TO_DATE(:updatedDate, 'YYYY-MM-DD')`
      );
      filterBinds.updatedDate = updatedDate;
    }

    if (podSignature) {
      whereClauses.push(`LOWER(OCR_STMP_SIGN) LIKE :podSignature`);
      filterBinds.podSignature = `%${podSignature}%`;
    }

    if (bolNumber) {
      whereClauses.push(`LOWER(OCR_BOLNO) LIKE :bolNumber`);
      filterBinds.bolNumber = `%${bolNumber}%`;
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT * FROM (
        SELECT t.*, ROW_NUMBER() OVER (ORDER BY CRTD_DTT DESC) AS rn
        FROM ${tableName} t
        ${whereSQL}
      )
      WHERE rn > :offset AND rn <= :maxRow
    `;
    const resultBinds = {
      ...filterBinds,
      offset: skip,
      maxRow: skip + limit,
    };

    const result = await connection.execute<OracleRow>(sql, resultBinds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log("result-> ", result);

    const matchedMongoIds = result.rows
      ?.map((oracleRow: OracleRow) => {
        const fileId = oracleRow.FILE_ID;

        const matchedMongoJob = (data.jobs as MongoJob[]).find((job) => {
          const cleanFileName = job.pdfUrl.replace(".pdf", "");
          return cleanFileName === fileId;
        });

        return matchedMongoJob?._id;
      })
      .filter(Boolean);

    const countSQL = `SELECT COUNT(*) AS TOTAL FROM ${tableName} ${whereSQL}`;
    const countResult = await connection.execute(
      countSQL,
      filterBinds,
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    console.log("matchedMongoIds-> ", matchedMongoIds);

    const totalJobs = (countResult.rows?.[0] as { TOTAL: number })?.TOTAL || 0;

    const rows = result.rows as OracleRow[];

    const jobs = rows.map((row: OracleRow) => {
      const matchedMongoJob = (data.jobs as MongoJob[]).find((job) => {
        const cleanFileName = job.pdfUrl.replace(".pdf", "");
        return cleanFileName === row.FILE_ID;
      });
    
      // Auto-copy all fields from Oracle row
      
    
      // Add/override with extra custom fields
      return {
        _id: matchedMongoJob?._id || row.FILE_ID,
      
        OCR_BOLNO: row.OCR_BOLNO,
        FILE_ID: row.FILE_ID,
        OCR_STMP_SIGN: row.OCR_STMP_SIGN,
        OCR_ISSQTY: row.OCR_ISSQTY ,
        OCR_RCVQTY: row.OCR_RCVQTY,
      
        OCR_SYMT_DAMG: row.OCR_SYMT_DAMG === "Y" ? 1 : 0,
        OCR_SYMT_SHRT: row.OCR_SYMT_SHRT === "Y" ? 1 : 0,
        OCR_SYMT_ORVG: row.OCR_SYMT_ORVG === "Y" ? 1 : 0,
        OCR_SYMT_REFS: row.OCR_SYMT_REFS === "Y" ? 1 : 0,
        OCR_STMP_POD_DTT: row.OCR_STMP_POD_DTT,
        CRTD_DTT: row.CRTD_DTT,
        OCR_SYMT_SEAL: row.OCR_SYMT_SEAL,
        OCR_SYMT_NONE: row.OCR_SYMT_NONE,
        UPTD_USR_CD: row.UPTD_USR_CD,
        customerOrderNum:"NULL",
        finalStatus : "NULL",
    reviewStatus : "NULL",
    recognitionStatus : "NULL",
    breakdownReason : "NULL",


      }
      
    });

    return NextResponse.json(
      { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
      { status: 200 }
    );
  } catch (err) {
    console.error("Oracle DB error:", err);
    return NextResponse.json({ error: "Oracle DB error" }, { status: 500 });
  } finally {
    if (connection) await connection.close();
  }
}
