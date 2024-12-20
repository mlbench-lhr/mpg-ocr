import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface Job {
  _id: ObjectId;
  blNumber: string;
  jobName: string;
  carrier: string;
  podDate: string;
  deliveryDate: string;
  podSignature: string;
  totalQty: number;
  delivered: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  noOfPages: number;
  sealIntact: string;
  finalStatus: string;
  reviewStatus: string;
  recognitionStatus: string;
  breakdownReason: string;
  reviewedBy: string;
  cargoDescription: string;
  receiverSignature: string;
}

// Handle GET requests for a single job by ID
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract the ID from the URL path

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");

    const dataCollection = db.collection<Job>("mockData");

    // Fetch the job by its ObjectId
    const job = await dataCollection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}

// Handle PATCH requests to update job data
// export async function PATCH(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop(); // Extract the ID from the URL path

//     if (!id) {
//       return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
//     }

//     // Parse the request body to get updated job data
//     const updatedJobData = await req.json();

//     const client = await clientPromise;
//     const db = client.db("my-next-app");

//     const dataCollection = db.collection<Job>("mockData");

//     // Update the job in the database
//     const result = await dataCollection.updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: updatedJobData,
//       }
//     );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ error: "Job not found or no changes made" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating job:", error);
//     return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
//   }
// }

// export async function PATCH(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop(); // Extract the ID from the URL path

//     if (!id) {
//       return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
//     }

//     // Parse the request body to get updated job data
//     const updatedJobData = await req.json();

//     const client = await clientPromise;
//     const db = client.db("my-next-app");

//     const dataCollection = db.collection<Job>("mockData");

//     // Add the updatedAt timestamp to the updated data
//     updatedJobData.updatedAt = new Date();

//     // Update the job in the database
//     const result = await dataCollection.updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: updatedJobData,
//       }
//     );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ error: "Job not found or no changes made" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating job:", error);
//     return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
//   }
// }


export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract the ID from the URL path

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Parse the request body to get updated job data
    const updatedJobData = await req.json();

    const headers = req.headers;
    const changedBy = headers.get("x-user-name") || "Unknown User";

    const client = await clientPromise;
    const db = client.db("my-next-app");

    const dataCollection = db.collection("mockData");
    const historyCollection = db.collection("jobHistory");

    // Find the existing job document
    const existingJob = await dataCollection.findOne({ _id: new ObjectId(id) });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Prepare history entries for changes
    const historyEntries = [];
    for (const [key, newValue] of Object.entries(updatedJobData)) {
      const oldValue = existingJob[key];
      if (oldValue != newValue) {
        historyEntries.push({
          jobId: new ObjectId(id),      
          field: key,                   
          oldValue: oldValue,          
          newValue: newValue,
          changedBy: changedBy,
          changedOn: new Date(),
        });
      }
    }

    // Add the updatedAt timestamp to the updated data
    updatedJobData.updatedAt = new Date();

    // Update the job in the database
    const result = await dataCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updatedJobData,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }

    // Insert history entries if there are any changes
    if (historyEntries.length > 0) {
      await historyCollection.insertMany(historyEntries);
    }

    return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET", "PATCH"] });
}
