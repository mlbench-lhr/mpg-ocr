import { NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
import { format, parse } from "date-fns";
import clientPromise from "@/lib/mongodb";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";

interface Job {
  _id?: ObjectId;
  blNumber: string | number;
  jobName?: string;
  podDate?: string;
  deliveryDate?: Date;
  podSignature?: string;
  totalQty?: number;
  received?: number;
  damaged?: number;
  short?: number;
  over?: number;
  refused?: number;
  noOfPages?: number;
  stampExists?: string;
  finalStatus?: string;
  reviewStatus?: string;
  recognitionStatus?: string;
  breakdownReason?: string;
  reviewedBy?: string;
  cargoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DB_NAME = process.env.DB_NAME || "my-next-app";

export async function GET(req: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const connectionStatusRes = await fetch(
      `${origin}/api/oracle/connection-status`
    );
    const connectionStatus = await connectionStatusRes.json();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;

    if (connectionStatus === "local") {
      return await getJobsFromMongo(url, skip, limit, page);
    } else {
      return await getJobsFromOracle(url, skip, limit, page);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET"] });
}

async function getJobsFromMongo(
  url: URL,
  skip: number,
  limit: number,
  page: number
) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const dataCollection = db.collection<Job>("mockData");

  const recognitionStatus = url.searchParams.get("recognitionStatus") || "";
  const reviewStatus = url.searchParams.get("reviewStatus") || "";
  const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
  const breakdownReason = url.searchParams.get("breakdownReason") || "";
  const podDateSignature = url.searchParams.get("podDateSignature") || "";
  const bolNumber = url.searchParams.get("bolNumber") || "";
  const jobName = url.searchParams.get("jobName") || "";
  const searchQuery = url.searchParams.get("search") || "";
  let podDate = url.searchParams.get("podDate") || "";

  const sortColumns = (url.searchParams.get("sortColumn") || "").split(",");
  const sortOrders = (url.searchParams.get("sortOrder") || "asc").split(",");

  const sortQuery: Record<string, 1 | -1> = {};
  sortColumns.forEach((col, idx) => {
    sortQuery[col] = sortOrders[idx] === "desc" ? -1 : 1;
  });

  const filter: Filter<Job> = {};
  if (podDateSignature)
    filter.podSignature = { $regex: podDateSignature.trim(), $options: "i" };
  if (bolNumber) {
    filter.blNumber = /^\d+$/.test(bolNumber)
      ? parseInt(bolNumber)
      : { $regex: bolNumber.trim(), $options: "i" };
  }
  if (jobName) filter.jobName = { $regex: jobName.trim(), $options: "i" };
  if (searchQuery) {
    const regex = { $regex: searchQuery, $options: "i" };
    filter.$or = [
      { blNumber: regex },
      { jobName: regex },
      { podSignature: regex },
    ];
  }
  if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
  if (reviewStatus) filter.reviewStatus = reviewStatus;
  if (reviewByStatus) filter.reviewedBy = reviewByStatus;
  if (breakdownReason) filter.breakdownReason = breakdownReason;

  if (podDate) {
    try {
      const parsedDate = parse(podDate, "yyyy-MM-dd", new Date());
      filter.podDate = format(parsedDate, "MM/dd/yy");
    } catch {}
  }

  const jobs = await dataCollection
    .find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .toArray();
  const totalJobs = await dataCollection.countDocuments(filter);

  return NextResponse.json(
    { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
    { status: 200 }
  );
}

async function getJobsFromOracle(
  url: URL,
  skip: number,
  limit: number,
  page: number
) {
  let connection;
  try {
    connection = await getOracleConnection(
      "numan",
      "numan786$",
      "192.168.0.145",
      "1539",
      "ORCLCDB"
    );

    if (!connection) {
      return NextResponse.json(
        { error: "Failed to establish OracleDB connection" },
        { status: 500 }
      );
    }

    const podSignature = url.searchParams.get("podDateSignature")?.trim().toLowerCase() || "";
    const bolNumber = url.searchParams.get("bolNumber")?.trim().toLowerCase() || "";

    // Prepare WHERE clause
    const whereClauses: string[] = [];
    const filterBinds: Record<string, any> = {};

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

    // SQL for paginated result
    const sql = `
      SELECT * FROM (
        SELECT t.*, ROW_NUMBER() OVER (ORDER BY CRTD_DTT DESC) AS rn
        FROM XTI_FILE_POD_OCR_T t
        ${whereSQL}
      )
      WHERE rn > :offset AND rn <= :maxRow
    `;

    const resultBinds = {
      ...filterBinds,
      offset: skip,
      maxRow: skip + limit,
    };

    const result = await connection.execute(sql, resultBinds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    // SQL for total count
    const countSQL = `SELECT COUNT(*) AS TOTAL FROM XTI_FILE_POD_OCR_T ${whereSQL}`;
    const countResult = await connection.execute(
      countSQL,
      filterBinds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalJobs = (countResult.rows as any)?.[0]?.TOTAL || 0;

    const rows = result.rows as {
      OCR_BOLNO: string;
      OCR_STMP_SIGN: string;
      OCR_ISSQTY: number;
      OCR_RCVQTY: number;
      OCR_SYMT_DAMG: string;
      OCR_SYMT_SHRT: string;
      OCR_SYMT_ORVG: string;
      OCR_SYMT_REFS: string;
      OCR_STMP_POD_DTT: string;
      CRTD_DTT: Date;
    }[];

    const jobs = rows.map((row) => ({
      blNumber: row.OCR_BOLNO,
      podSignature: row.OCR_STMP_SIGN,
      totalQty: row.OCR_ISSQTY,
      received: row.OCR_RCVQTY,
      damaged: row.OCR_SYMT_DAMG === "Y" ? 1 : 0,
      short: row.OCR_SYMT_SHRT === "Y" ? 1 : 0,
      over: row.OCR_SYMT_ORVG === "Y" ? 1 : 0,
      refused: row.OCR_SYMT_REFS === "Y" ? 1 : 0,
      podDate: row.OCR_STMP_POD_DTT,
      createdAt: row.CRTD_DTT,
    }));

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

