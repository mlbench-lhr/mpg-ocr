import { NextResponse } from "next/server";
import { getOracleConnection } from "@/lib/oracle";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import oracledb from "oracledb";

interface FileRow {
  FILE_ID: string;
  FILE_NAME: string;
  FILE_DATA: oracledb.Lob | null;
}

export async function PUT(req: Request) {
  //   const logs: { fileName: string; message: string }[] = []; // <-- added this
  const logs: Array<{
    fileName: string;
    status: "added" | "updated" | "not_found";
    message: string;
    logDescription: string;
    connectionResult: string;
  }> = [];

  try {
    let connectionResult;
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided for update" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const connectionsCollection = db.collection("db_connections");
    const jobCollection = db.collection("mockData");

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

    let connection: oracledb.Connection | null;
    try {
      connection = await getOracleConnection(
        userName,
        password,
        ipAddress,
        portNumber,
        serviceName
      );

      if (!connection) {
        connectionResult =
          "Failed to establish OracleDB connection check DB type";
        return NextResponse.json(
          { error: "Failed to establish OracleDB connection" },
          { status: 500 }
        );
      } else {
        connectionResult = "Successfully connected to OracleDB";
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        connectionResult = `OracleDB connection error: ${error.message}`;
      } else {
        connectionResult = "OracleDB connection error: Unknown error";
      }

      return NextResponse.json({ error: connectionResult }, { status: 500 });
    }
    const conn: oracledb.Connection = connection;
    const objectIds = ids.map((id) => new ObjectId(id));

    const jobsToUpdate = await jobCollection
      .find({ _id: { $in: objectIds } })
      .toArray();


    for (const job of jobsToUpdate) {
      let { fileId } = job;
      const file_name = job.pdfUrl.split("/").pop() || "";
      const currentYear = new Date().getFullYear();
      const fileTable = `XTI_${currentYear}_T`;

      if (!fileId) {
        const result = await conn.execute<FileRow>(
          `SELECT FILE_ID FROM ${fileTable} WHERE FILE_NAME = :file_name`,
          { file_name },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const row = result.rows?.[0] as FileRow | undefined;
        fileId = row?.FILE_ID;
      }

      if (!fileId) {
        logs.push({
          fileName: file_name,
          status: "not_found",
          message: "File not found",
          logDescription: `No matching file found in the Oracle DB with the name ${file_name}`,
          connectionResult,
        });
        continue;
      }

      // handle podDate formatting...
      let podDateValue = null;
      if (job.podDate) {
        const columnTypeQuery = await conn.execute(
          `SELECT DATA_TYPE 
         FROM ALL_TAB_COLUMNS 
         WHERE OWNER = '${process.env.ORACLE_DB_USER_NAME}' AND TABLE_NAME = 'XTI_FILE_POD_OCR_T' AND COLUMN_NAME = 'OCR_STMP_POD_DTT'`,
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const rows = columnTypeQuery.rows as
          | Array<{ DATA_TYPE: string }>
          | undefined;
        const columnType = rows?.[0]?.DATA_TYPE ?? null;
        podDateValue =
          columnType === "DATE" ? new Date(job.podDate) : job.podDate;
      }

      // check for existing record in OCR table
      const existingCheck = await conn.execute(
        `SELECT FILE_ID FROM ${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T WHERE FILE_ID = :fileId`,
        { fileId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const recordExists = existingCheck.rows && existingCheck.rows.length > 0;

      if (recordExists) {
        await conn.execute(
          `UPDATE ${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T
         SET OCR_BOLNO = :bolNo, 
             OCR_ISSQTY = :issQty, 
             OCR_RCVQTY = :rcvQty,
             OCR_STMP_POD_DTT = :podDate, 
             OCR_STMP_SIGN = :sign, 
             OCR_SYMT_NONE = :symtNone, 
             OCR_SYMT_DAMG = :symtDamg, 
             OCR_SYMT_SHRT = :symtShrt, 
             OCR_SYMT_ORVG = :symtOrvg, 
             OCR_SYMT_REFS = :symtRefs, 
             OCR_SYMT_SEAL = :symtSeal,
             RECV_DATA_DTT = SYSDATE,
             UPTD_USR_CD = 'OCR',
             UPTD_DTT = SYSDATE
         WHERE FILE_ID = :fileId`,
          {
            bolNo: job.blNumber,
            issQty: job.totalQty,
            rcvQty: job.received,
            podDate: podDateValue,
            sign: job.podSignature,
            symtNone: "N",
            symtDamg: job.damaged,
            symtShrt: job.short,
            symtOrvg: job.over,
            symtRefs: job.refused,
            symtSeal: job.sealIntact,
            fileId,
          }
        );
        logs.push({
          fileName: file_name,
          status: "updated",
          message: `File found in ${fileTable} table and File ID ${fileId} successfully updated in XTI_FILE_POD_OCR_T`,
          logDescription: "OCR data updated successfully in OracleDB",
          connectionResult,
        });
      } else {
        await conn.execute(
          `INSERT INTO ${process.env.ORACLE_DB_USER_NAME}.XTI_FILE_POD_OCR_T 
          (FILE_ID, OCR_BOLNO, OCR_ISSQTY, OCR_RCVQTY, OCR_STMP_POD_DTT, OCR_STMP_SIGN, 
           OCR_SYMT_NONE, OCR_SYMT_DAMG, OCR_SYMT_SHRT, OCR_SYMT_ORVG, OCR_SYMT_REFS, OCR_SYMT_SEAL,
           RECV_DATA_DTT, UPTD_USR_CD, UPTD_DTT)
       VALUES 
          (:fileId, :bolNo, :issQty, :rcvQty, :podDate, :sign, 
           :symtNone, :symtDamg, :symtShrt, :symtOrvg, :symtRefs, :symtSeal,
           SYSDATE, 'OCR', SYSDATE)`,
          {
            fileId,
            bolNo: job.blNumber,
            issQty: job.totalQty,
            rcvQty: job.received,
            podDate: podDateValue,
            sign: job.podSignature,
            symtNone: "N",
            symtDamg: job.damaged,
            symtShrt: job.short,
            symtOrvg: job.over,
            symtRefs: job.refused,
            symtSeal: job.sealIntact,
          }
        );
        logs.push({
          fileName: file_name,
          status: "added",
          message: `File found in ${fileTable} table and File ID ${fileId} successfully inserted into XTI_FILE_POD_OCR_T`,
          logDescription: "OCR data updated successfully in OracleDB",
          connectionResult,
        });
      }
    }

    await conn.commit();
    await conn.close();

    const logsCollection = db.collection("logs");
    await logsCollection.insertMany(
      logs.map((log) => ({
        fileName: log.fileName,
        status: log.status,
        message: log.message,
        logDescription: log.logDescription,
        timestamp: new Date(),
        connectionResult: connectionResult,
      }))
    );

    return NextResponse.json({
      message: "OCR data updated successfully in OracleDB",
      logs,
    });
  } catch (err: unknown) {
    let errorMessage = "An unknown error occurred";
    if (err instanceof Error) {
      errorMessage = err.message;
      console.error("Error updating OCR data:", err);
    }

    if (logs.length > 0) {
      logs[logs.length - 1].logDescription = errorMessage;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
