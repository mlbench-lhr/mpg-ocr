// import { NextResponse } from 'next/server';
// import clientPromise from "@/lib/mongodb";
// import { ObjectId, WithId } from "mongodb";
// import { Document } from 'bson';


// export async function POST(req: Request) {
//     try {
//         const dataArray = await req.json();

//         if (!Array.isArray(dataArray)) {
//             return NextResponse.json({ error: "Input must be an array of objects" }, { status: 400 });
//         }

//         const requiredFields = [
//             "blNumber", "jobId", "pdfUrl", "podDate", "podSignature", "totalQty",
//             "received", "damaged", "short", "over", "refused", "customerOrderNum", "stampExists",
//             "finalStatus", "reviewStatus", "recognitionStatus", "breakdownReason", "reviewedBy", "cargoDescription"
//         ];

//         const client = await clientPromise;
//         const db = client.db(DB_NAME);

//         const bulkOps = [];
//         const jobIds = Array.from(new Set(dataArray.map(data => data.jobId).filter(jobId => !!jobId))).map(id => new ObjectId(id));

//         const jobs = await db.collection("jobs").find({ _id: { $in: jobIds } }).toArray();
//         const jobMap = jobs.reduce<Record<string, WithId<Document>>>((map, job) => {
//             map[job._id.toString()] = job;
//             return map;
//         }, {});



//         for (const data of dataArray) {
//             for (const field of requiredFields) {
//                 // if (!(field in data)) {
//                 //     return NextResponse.json({ error: `${field} is missing in one of the objects` }, { status: 400 });
//                 // }

//                 if (typeof data[field] === "string") {
//                     data[field] = data[field].trim();
//                 }
//             }

//             const { jobId } = data;
//             if (!jobId) {
//                 return NextResponse.json({ error: "jobId is missing in one of the objects" }, { status: 400 });
//             }

//             const job = jobMap[jobId];

//             if (!job) {
//                 return NextResponse.json({ error: `Job not found for jobId: ${jobId}` }, { status: 404 });
//             }

//             data.jobName = job.jobName;

//             if (typeof data.blNumber === "number") {
//                 data.blNumber = data.blNumber.toString();
//             }

//             bulkOps.push({
//                 insertOne: {
//                     document: {
//                         ...data,
//                         createdAt: new Date(),
//                         // updatedAt: new Date(),
//                     },
//                 },
//             });
//         }

//         if (bulkOps.length > 0) {
//             const result = await db.collection("mockData").bulkWrite(bulkOps);
//             return NextResponse.json({ message: "Data saved successfully", insertedCount: result.insertedCount }, { status: 200 });
//         } else {
//             return NextResponse.json({ error: "No valid data to save" }, { status: 400 });
//         }
//     } catch (error) {
//         console.log("Error saving mock data:", error);
//         return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
//     }
// }

const DB_NAME = process.env.DB_NAME || "my-next-app";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const dataArray = await req.json();

    if (!Array.isArray(dataArray)) {
      return NextResponse.json({ error: "Input must be an array of objects" }, { status: 400 });
    }

    const requiredFields = [
      "blNumber", "jobId", "pdfUrl", "podDate", "podSignature", "totalQty",
      "received", "damaged", "short", "over", "refused", "customerOrderNum", "stampExists",
      "finalStatus", "reviewStatus", "recognitionStatus", "breakdownReason", "reviewedBy", "cargoDescription"
    ];

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Fetch existing documents with the same pdfUrl to avoid duplicate entries
    const existingRecords = await db.collection("mockData").find(
      { pdfUrl: { $in: dataArray.map(d => d.pdfUrl) } }
    ).toArray();

    // Create a map of existing pdfUrls
    const existingMap = new Map(existingRecords.map(record => [record.pdfUrl, record]));

    const bulkOps = [];

    for (const data of dataArray) {
      for (const field of requiredFields) {
        if (typeof data[field] === "string") {
          data[field] = data[field].trim();
        }
      }

      const { jobId, pdfUrl } = data;

      // Ensure jobId is properly assigned
      if (!jobId || jobId.trim() === "") {
        data.jobId = "";
        data.jobName = "";
      } else {
        const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
        data.jobName = job ? job.jobName : "";
      }

      if (typeof data.blNumber === "number") {
        data.blNumber = data.blNumber.toString();
      }

      // If pdfUrl already exists, update it instead of inserting a new record
      if (existingMap.has(pdfUrl)) {
        bulkOps.push({
          updateOne: {
            filter: { pdfUrl },
            update: { $set: { ...data } }
            // update: { $set: { ...data, updatedAt: new Date() } }
          }
        });
      } else {
        // Insert a new record if pdfUrl does not exist
        bulkOps.push({
          insertOne: {
            document: {
              ...data,
              createdAt: new Date(),
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      const result = await db.collection("mockData").bulkWrite(bulkOps);
      return NextResponse.json(
        { message: "Data processed successfully", modifiedCount: result.modifiedCount, insertedCount: result.insertedCount },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "No valid data to process" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error saving/updating mock data:", error);
    return NextResponse.json({ error: "Failed to save/update mock data" }, { status: 500 });
  }
}


