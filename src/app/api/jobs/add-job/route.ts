import { NextResponse } from "next/server";
import { MongoClient, ObjectId, Filter } from "mongodb";


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "my-next-app";
const client = new MongoClient(MONGODB_URI);

interface Job {
  active?: boolean;
  selectedDays?: string;
}

let isConnected = false; // Global flag to track connection status

async function connectToDatabase() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db(DB_NAME);
}

// POST: Add Job
export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const jobsCollection = db.collection("jobs");

    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime } = body;

    // Input validation
    if (!selectedDays || !selectedDays.length || !fromTime || !toTime || !everyTime) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const result = await jobsCollection.insertOne({
      selectedDays,
      fromTime,
      toTime,
      everyTime,
      active: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Job added successfully.", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding job:", error);
    return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
  }
}

// GET: Fetch Jobs
export async function GET(req: Request) {
  try {
    const db = await connectToDatabase();
    const jobsCollection = db.collection("jobs");

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const searchQuery = url.searchParams.get("search") || "";

    let filter: Filter<Job> = {};

    // Build filter based on query
    if (searchQuery) {
      const isActive = searchQuery.toLowerCase() === "active" ? true : searchQuery.toLowerCase() === "inactive" ? false : null;
      if (isActive !== null) {
        filter = { active: isActive };
      } else {
        filter = { $or: [{ selectedDays: { $regex: searchQuery, $options: "i" } }] };
      }
    }

    const jobs = await jobsCollection.find(filter).skip(skip).limit(limit).toArray();
    const totalJobs = await jobsCollection.countDocuments(filter);

    return NextResponse.json(
      { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }
}

// PATCH: Update Job Status
export async function PATCH(req: Request) {
  try {
    const db = await connectToDatabase();
    const jobsCollection = db.collection("jobs");

    const { id, active } = await req.json();

    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ObjectId format." }, { status: 400 });
    }

    const objectId = new ObjectId(id);

    const result = await jobsCollection.updateOne(
      { _id: objectId },
      { $set: { active } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job status updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json({ error: "Failed to update job status." }, { status: 500 });
  }
}

// OPTIONS: Define Allowed Methods
export async function OPTIONS() {
  return NextResponse.json({ allowedMethods: ["POST", "GET", "PATCH"] });
}
