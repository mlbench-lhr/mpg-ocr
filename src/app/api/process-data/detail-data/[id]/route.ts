import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface Job {
  _id: ObjectId;
  blNumber: string;
  carrier: string;
  podDate: string;
  podSignature: string;
  totalQty: number;
  delivered: number;
  damaged: number;
  short: number;
  over: number;
  refused: number;
  sealIntact: string;
  finalStatus: string;
  reviewStatus: string;
  recognitionStatus: string;
  breakdownReason: string;
  reviewedBy: string;
  cargoDescription: string;
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

export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["GET"] });
}
