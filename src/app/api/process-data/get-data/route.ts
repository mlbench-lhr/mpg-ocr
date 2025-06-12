import { NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
import { format, parse } from "date-fns";
import clientPromise from "@/lib/mongodb";
import { getOracleOCRData } from "@/lib/oracleOCRData";

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
    console.log("connection status-> ", connectionStatus);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;

    if (connectionStatus.dataBase === "local") {
      return await getJobsFromMongo(url, skip, limit, page);
    } else {
      return await getOracleOCRData(url, skip, limit, page);
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

  let podDate = url.searchParams.get("podDate") || "";
  const podDateSignature = url.searchParams.get("podDateSignature") || "";
  const bolNumber = url.searchParams.get("bolNumber") || "";
  const jobName = url.searchParams.get("jobName") || "";
  const searchQuery = url.searchParams.get("search") || "";
  const filter: Filter<Job> = {};

  const sortColumnsString = url.searchParams.get("sortColumn");
  const sortColumns = sortColumnsString ? sortColumnsString.split(",") : [];

  const sortOrderString = url.searchParams.get("sortOrder") || "asc";
  const sortOrders = sortOrderString.split(",");

  const sortQuery: Record<string, 1 | -1> = {};

  sortColumns.forEach((column, index) => {
    const order = sortOrders[index] === "desc" ? -1 : 1;
    sortQuery[column] = order;
  });

  if (sortOrders.length < sortColumns.length) {
    for (let i = sortOrders.length; i < sortColumns.length; i++) {
      sortQuery[sortColumns[i]] = 1;
    }
  }

  console.log("Final Sort Query:", sortQuery);

  if (podDateSignature) {
    filter.podSignature = { $regex: podDateSignature.trim(), $options: "i" };
  }
  // if (bolNumber) {
  //     filter.blNumber = { $regex: bolNumber.trim(), $options: "i" };
  // }

  if (bolNumber) {
    if (/^\d+$/.test(bolNumber)) {
      filter.blNumber = parseInt(bolNumber, 10);
    } else {
      filter.blNumber = { $regex: bolNumber.trim(), $options: "i" };
    }
  }

  if (jobName) {
    filter.jobName = { $regex: jobName.trim(), $options: "i" };
  }
  if (searchQuery) {
    const searchRegex = { $regex: searchQuery, $options: "i" };
    filter.$or = [
      { blNumber: searchRegex },
      { jobName: searchRegex },
      { podSignature: searchRegex },
    ];
  }

  if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
  if (reviewStatus) filter.reviewStatus = reviewStatus;
  if (reviewByStatus) filter.reviewedBy = reviewByStatus;
  if (breakdownReason) filter.breakdownReason = breakdownReason;

  if (podDate) {
    try {
      const parsedDate = parse(podDate, "yyyy-MM-dd", new Date());
      podDate = format(parsedDate, "MM/dd/yy");
      filter.podDate = podDate;
    } catch (error) {
      console.log("Invalid podDate format:", error);
    }
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


// async function getJobsFromOracle(
//   url: URL,
//   skip: number,
//   limit: number,
//   page: number
// ) {
//   let connection;
//   try {
//     const client = await clientPromise;
//     const db = client.db("my-next-app");
//     const connectionsCollection = db.collection("db_connections");
//     const userDBCredentials = await connectionsCollection.findOne(
//       {},
//       { sort: { _id: -1 } }
//     );
//     if (!userDBCredentials) {
//       return NextResponse.json(
//         { message: "OracleDB credentials not found" },
//         { status: 404 }
//       );
//     }

//     const { userName, password, ipAddress, portNumber, serviceName } =
//       userDBCredentials;
//     connection = await getOracleConnection(
//       userName,
//       password,
//       ipAddress,
//       portNumber,
//       serviceName
//     );

//     if (!connection) {
//       return NextResponse.json(
//         { error: "Failed to establish OracleDB connection" },
//         { status: 500 }
//       );
//     }
//     const podSignature =
//       url.searchParams.get("podDateSignature")?.trim().toLowerCase() || "";
//     const bolNumber =
//       url.searchParams.get("bolNumber")?.trim().toLowerCase() || "";
//     const createdDate = url.searchParams.get("createdDate") || "";
//     const updatedDate = url.searchParams.get("updatedDate") || "";
//     const uptd_Usr_Cd = url.searchParams.get("uptd_Usr_Cd") || "";

//     const isOCR = uptd_Usr_Cd.toLowerCase() === "ocr";

//     if (!isOCR) {
//       const apiRes = await fetch("http://localhost:3000/api/pod/retrieve");
//       const apiData: PodFile[] = await apiRes.json();
//       const jobs = apiData.map((row: PodFile) => ({
//         fileId: row.FILE_ID,
//       }));
//       return NextResponse.json(
//         {
//           jobs,
//           totalJobs: apiData.length,
//           page,
//           totalPages: 1,
//         },
//         { status: 200 }
//       );
//     }

//     const tableName = `${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T`;

//     const whereClauses: string[] = [];
//     const filterBinds: Record<string, string | Date | number> = {};

//     if (uptd_Usr_Cd) {
//       whereClauses.push(`LOWER(UPTD_USR_CD) = :uptd_Usr_Cd`);
//       filterBinds.uptd_Usr_Cd = uptd_Usr_Cd.toLowerCase();
//     }

//     if (createdDate) {
//       whereClauses.push(
//         `TRUNC(CRTD_DTT) = TO_DATE(:createdDate, 'YYYY-MM-DD')`
//       );
//       filterBinds.createdDate = createdDate;
//     }

//     if (updatedDate) {
//       whereClauses.push(
//         `TRUNC(UPTD_DTT) = TO_DATE(:updatedDate, 'YYYY-MM-DD')`
//       );
//       filterBinds.updatedDate = updatedDate;
//     }

//     if (podSignature) {
//       whereClauses.push(`LOWER(OCR_STMP_SIGN) LIKE :podSignature`);
//       filterBinds.podSignature = `%${podSignature}%`;
//     }

//     if (bolNumber) {
//       whereClauses.push(`LOWER(OCR_BOLNO) LIKE :bolNumber`);
//       filterBinds.bolNumber = `%${bolNumber}%`;
//     }

//     const whereSQL =
//       whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     const sql = `
//       SELECT * FROM (
//         SELECT t.*, ROW_NUMBER() OVER (ORDER BY CRTD_DTT DESC) AS rn
//         FROM ${tableName} t
//         ${whereSQL}
//       )
//       WHERE rn > :offset AND rn <= :maxRow
//     `;

//     const resultBinds = {
//       ...filterBinds,
//       offset: skip,
//       maxRow: skip + limit,
//     };

//     const result = await connection.execute(sql, resultBinds, {
//       outFormat: oracledb.OUT_FORMAT_OBJECT,
//     });

//     const countSQL = `SELECT COUNT(*) AS TOTAL FROM ${tableName} ${whereSQL}`;
//     const countResult = await connection.execute(countSQL, filterBinds, {
//       outFormat: oracledb.OUT_FORMAT_OBJECT,
//     });

//     const totalJobs = (countResult.rows?.[0] as { TOTAL: number })?.TOTAL || 0;

//     const rows = result.rows as OracleRow[];

//     const jobs = rows.map((row) => ({
//       blNumber: row.OCR_BOLNO,
//       fileId: row.FILE_ID,
//       podSignature: row.OCR_STMP_SIGN,
//       totalQty: row.OCR_ISSQTY,
//       received: row.OCR_RCVQTY,
//       damaged: row.OCR_SYMT_DAMG === "Y" ? 1 : 0,
//       short: row.OCR_SYMT_SHRT === "Y" ? 1 : 0,
//       over: row.OCR_SYMT_ORVG === "Y" ? 1 : 0,
//       refused: row.OCR_SYMT_REFS === "Y" ? 1 : 0,
//       podDate: row.OCR_STMP_POD_DTT,
//       createdAt: row.CRTD_DTT,
//       sealIntact: row.OCR_SYMT_SEAL,
//       stampExists: row.OCR_SYMT_NONE === "N" ? "no" : "yes",
//       reviewedBy: row.UPTD_USR_CD,
//     }));

//     return NextResponse.json(
//       { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("Oracle DB error:", err);
//     return NextResponse.json({ error: "Oracle DB error" }, { status: 500 });
//   } finally {
//     if (connection) await connection.close();
//   }
// }
