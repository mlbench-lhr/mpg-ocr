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

const DB_NAME = process.env.DB_NAME || "my-next-app";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileId = url.pathname.split("/").pop();

    if (!fileId) {
      return NextResponse.json({ error: "FILE_ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const dataCollection = db.collection<FileDataProps>("mockData");
    console.log("Looking for FILE_ID:", fileId);
    const job = await dataCollection.findOne({ FILE_ID: fileId });
    console.log("Jobs ->",job);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error fetching job by FILE_ID:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const existingJob = await dataCollection.findOne({ FILE_ID: fileId });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if ("_id" in rawBody) {
      delete rawBody._id;
    }

    const updatedJobData: FileDataProps = FileData.fromPartial({
      ...rawBody,
      updatedAt: new Date(),
    });

    const historyEntries = [];

    for (const key in updatedJobData) {
      const newValue = updatedJobData[key as keyof FileDataProps];
      const oldValue = existingJob[key as keyof FileDataProps];

      if (oldValue != newValue) {
        historyEntries.push({
          fileId: fileId,
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
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET", "PATCH"] });
}
