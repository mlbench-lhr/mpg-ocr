import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { FileData, FileDataProps } from "@/lib/FileData";

const DB_NAME = process.env.DB_NAME || "my-next-app";

export async function POST(req: Request) {
  try {
    const dataArray = await req.json();
    console.log("Data Array ->",dataArray);
    if (!Array.isArray(dataArray)) {
      return NextResponse.json(
        { error: "Input must be an array of objects" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
console.log("data array-> ", dataArray);
    const pdfUrls = dataArray.map((d) => d.pdfUrl);
    const existingRecords = await db
      .collection("mockData")
      .find({ pdfUrl: { $in: pdfUrls } })
      .toArray();

    const existingMap = new Map(
      existingRecords.map((record) => [record.pdfUrl, record])
    );

    const bulkOps = [];

    for (const rawData of dataArray) {
      // Trim string fields
      for (const key in rawData) {
        if (typeof rawData[key] === "string") {
          rawData[key] = rawData[key].trim();
        }
      }

      // Convert numeric fields if needed
      const intFields = [
        "OCR_ISSQTY",
        "OCR_RCVQTY",
        "OCR_SYMT_DAMG",
        "OCR_SYMT_SHRT",
        "OCR_SYMT_ORVG",
        "OCR_SYMT_REFS",
      ];
      for (const field of intFields) {
        const val = rawData[field];
        if (typeof val === "string" && /^\d+$/.test(val)) {
          rawData[field] = parseInt(val, 10);
        }
      }

      // Assign job name if jobId is provided
      if (!rawData.jobId || rawData.jobId.trim() === "") {
        rawData.jobId = "";
        rawData.jobName = "";
      } else {
        const job = await db
          .collection("jobs")
          .findOne({ _id: new ObjectId(rawData.jobId) });
        rawData.jobName = job ? job.jobName : "";
      }

      // Convert blNumber to number if it's numeric string
      if (typeof rawData.blNumber === "string" && /^\d+$/.test(rawData.blNumber)) {
        rawData.blNumber = parseInt(rawData.blNumber, 10);
      }

      // Ensure FILE_ID is auto-filled if missing
      if (!rawData.FILE_ID && rawData.pdfUrl) {
        const filename = rawData.pdfUrl.split("/").pop() || "";
        rawData.FILE_ID = filename.replace(/\.[^/.]+$/, ""); // Remove extension
      }
       
      // Build file data object
      const fileData: FileDataProps = FileData.fromMongoDB({
        ...rawData,
    
        uptd_Usr_Cd: rawData.uptd_Usr_Cd || "OCR",
      });
      console.log("File Data ->", fileData);

      const { pdfUrl } = fileData;

      if (existingMap.has(pdfUrl)) {
        bulkOps.push({
          updateOne: {
            filter: { pdfUrl },
            update: { $set: fileData },
          },
        });
      } else {
        bulkOps.push({
          insertOne: {
            document: {
              ...fileData,
              createdAt: new Date(),
            },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      const result = await db.collection("mockData").bulkWrite(bulkOps);
      return NextResponse.json(
        {
          message: "Data processed successfully",
          modifiedCount: result.modifiedCount,
          insertedCount: result.insertedCount,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No valid data to process" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error saving/updating mock data:", error);
    return NextResponse.json(
      { error: "Failed to save/update mock data" },
      { status: 500 }
    );
  }
}
