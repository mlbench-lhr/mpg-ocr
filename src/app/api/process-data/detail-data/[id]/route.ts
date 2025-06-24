// import { NextResponse } from "next/server";
// import { ObjectId } from "mongodb";
// import clientPromise from "@/lib/mongodb";
// import { FileData, FileDataProps } from "@/lib/FileData";

// const DB_NAME = process.env.DB_NAME || "my-next-app";

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id) {
//       return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db(DB_NAME);
//     const dataCollection = db.collection<FileDataProps>("mockData");

//     const job = await dataCollection.findOne({ _id: new ObjectId(id) });

//     if (!job) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json(job, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching job by ID:", error);
//     return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
//   }
// }

// export async function PATCH(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id) {
//       return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
//     }

//     const rawBody = await req.json();

//     // Convert numeric fields from strings
//     const intFields = [
//       "totalQty", "received", "damaged", "short", "over", "refused",
//     ];

//     for (const field of intFields) {
//       const val = rawBody[field];
//       if (typeof val === "string" && /^\d+$/.test(val)) {
//         rawBody[field] = parseInt(val, 10);
//       }
//     }

//     const headers = req.headers;
//     const changedBy = headers.get("x-user-name") || "Unknown User";

//     const client = await clientPromise;
//     const db = client.db(DB_NAME);

//     const dataCollection = db.collection<FileDataProps>("mockData");
//     const historyCollection = db.collection("jobHistory");

//     const existingJob = await dataCollection.findOne({ _id: new ObjectId(id) });

//     if (!existingJob) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     // Remove _id from body before processing
//     if ("_id" in rawBody) {
//       delete rawBody._id;
//     }

//     // Create structured FileData object
//     const updatedJobData: FileDataProps = FileData.fromPartial({
//       ...rawBody,
//       updatedAt: new Date(),
//     });

//     const historyEntries = [];

//     for (const key in updatedJobData) {
//       const newValue = updatedJobData[key as keyof FileDataProps];
//       const oldValue = existingJob[key as keyof FileDataProps];

//       if (oldValue != newValue) {
//         historyEntries.push({
//           jobId: new ObjectId(id),
//           field: key,
//           oldValue,
//           newValue,
//           changedBy,
//           changedOn: new Date(),
//         });
//       }
//     }

//     if (historyEntries.length === 0) {
//       return NextResponse.json({ message: "No changes detected." }, { status: 200 });
//     }

//     const result = await dataCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedJobData }
//     );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ error: "No changes made" }, { status: 400 });
//     }

//     if (historyEntries.length > 0) {
//       await historyCollection.insertMany(historyEntries);
//     }

//     return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating job:", error);
//     return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
//   }
// }

// export async function OPTIONS() {
//   return NextResponse.json({ allowedMethods: ["GET", "PATCH"] });
// }




import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { FileData, FileDataProps } from "@/lib/FileData";
import oracledb from "oracledb";

const DB_NAME = process.env.DB_NAME || "my-next-app";
const ORACLE_TABLE = "XTI_2025_T";
// import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";
import { getDBConnectionType } from "@/lib/JsonDBConfig/getDBConnectionType";

export async function GET(req: Request) {
  let connection: any;

  try {
    const url = new URL(req.url);
    let fileId = url.pathname.split("/").pop();

    if (!fileId) {
      return NextResponse.json({ error: "FILE_ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const dataCollection = db.collection<FileDataProps>("mockData");

    console.log("Looking for FILE_ID in MongoDB:", fileId);
    fileId = decodeURIComponent(fileId).trim();
    let job = await dataCollection.findOne({ FILE_ID: fileId });

    // If FILE_DATA is missing, fetch it from Oracle
    if (job && !job.FILE_DATA) {
      try {
        const userName = process.env.ORACLE_DB_USER_NAME!;
        const password = 'numan786$';
        const ipAddress = '192.168.0.145';     // e.g. '192.168.1.10'
        const portNumber = '1539';     // e.g. '1521'
        const serviceName = 'ORCLCDB'; // e.g. 'orclpdb1'
    
        connection = await getOracleConnection(
          userName,
          password,
          ipAddress,
          portNumber,
          serviceName
        );
    
        const fileResult = await connection.execute(
                  `SELECT FILE_DATA FROM ${process.env.ORACLE_DB_USER_NAME}.${ORACLE_TABLE} WHERE FILE_ID = :fileId`,
                  { fileId},
                  {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    fetchInfo: {
                      FILE_DATA: { type: (oracledb as any).BUFFER }, // 🔧 bypass TypeScript
                    },
                  }
                );
        
                const fileRow = fileResult.rows?.[0];

        if (fileRow?.FILE_DATA) {
          const base64Data = fileRow.FILE_DATA.toString("base64");

          await dataCollection.updateOne(
            { FILE_ID: fileId },
            {
              $set: {
                FILE_DATA: base64Data,
                // FILE_NAME: fileRow.FILE_NAME,
                updatedAt: new Date(),
              }
            }
          );

          // Re-fetch with updated FILE_DATA
          job = await dataCollection.findOne({ FILE_ID: fileId });
        }
      } catch (oracleError) {
        console.error("OracleDB fetch error:", oracleError);
      } finally {
        if (connection) await connection.close();
      }
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error in GET /file/:id:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  let oracleConn: oracledb.Connection | null = null;

  try {
    const url = new URL(req.url);
    const fileId = url.pathname.split("/").pop();

    if (!fileId) {
      return NextResponse.json({ error: "FILE_ID is required" }, { status: 400 });
    }

    const rawBody = await req.json();

    const intFields = ["totalQty", "received", "damaged", "short", "over", "refused"];
    for (const field of intFields) {
      const val = rawBody[field];
      if (typeof val === "string" && /^\d+$/.test(val)) {
        rawBody[field] = parseInt(val, 10);
      }
    }

    const headers = req.headers;
    const changedBy = headers.get("x-user-name") || "Unknown User";

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const dataCollection = db.collection<FileDataProps>("mockData");
    const historyCollection = db.collection("jobHistory");

    let existingJob = await dataCollection.findOne({ FILE_ID: fileId });

    console.log("Detail Data");

    // ⬇️ If FILE_DATA is missing, fetch from Oracle and update
    if (existingJob && !existingJob.FILE_DATA) {
      try {
        oracleConn = await oracledb.getConnection({
          user: process.env.ORACLE_DB_USER,
          password: process.env.ORACLE_DB_PASSWORD,
          connectionString: process.env.ORACLE_DB_CONN_STR,
        });
        
        const oracleResult = await oracleConn.execute(
          `SELECT FILE_DATA, FILE_NAME, FILE_TYPE FROM ${process.env.ORACLE_DB_USER_NAME}.${ORACLE_TABLE} WHERE FILE_ID = :fileId`,
          [fileId],
          {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
              "FILE_DATA": { type: oracledb.DEFAULT }
            }
          }
        );

        console.log("Updating FILE_DATA for FILE_ID:", oracleResult);
        const row = oracleResult.rows?.[0] as {
          FILE_DATA: Buffer;
          FILE_NAME: string;
          FILE_TYPE: string;
        };

        

        if (row?.FILE_DATA) {
          const base64Data = row.FILE_DATA.toString("base64");

          await dataCollection.updateOne(
            { FILE_ID: fileId },
            {
              $set: {
                FILE_DATA: base64Data,
                FILE_NAME: row.FILE_NAME,
                updatedAt: new Date(),
              }
            }
          );
          existingJob = await dataCollection.findOne({ FILE_ID: fileId }); // re-fetch
        }
      } catch (oracleError) {
        console.error("Error fetching BLOB from Oracle:", oracleError);
      } finally {
        if (oracleConn) await oracleConn.close();
      }
    }

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if ("_id" in rawBody) {
      delete rawBody._id;
    }

    const updatedJobData: FileDataProps = FileData.fromMongoDB({
      ...rawBody,
      updatedAt: new Date(),
    });

    const historyEntries = [];

    for (const key in updatedJobData) {
      const newValue = updatedJobData[key as keyof FileDataProps];
      const oldValue = existingJob[key as keyof FileDataProps];

      if (oldValue != newValue) {
        historyEntries.push({
          fileId,
          field: key,
          oldValue,
          newValue,
          changedBy,
          changedOn: new Date(),
        });
      }
    }

    if (historyEntries.length === 0) {
      return NextResponse.json({ message: "No changes detected." }, { status: 200 });
    }

    const result = await dataCollection.updateOne(
      { FILE_ID: fileId },
      { $set: updatedJobData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }

    if (historyEntries.length > 0) {
      await historyCollection.insertMany(historyEntries);
    }

    return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  } finally {
    if (oracleConn) {
      try {
        await oracleConn.close();
      } catch (e) {
        console.error("Error closing Oracle connection:", e);
      }
    }
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET", "PATCH"] });
}
