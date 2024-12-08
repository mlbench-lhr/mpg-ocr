import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.DB_NAME || "my-next-app";

// Connect to the database and get the collection
async function getJobsCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("jobs");
}

// POST: Add Job
export async function POST(req: Request) {
  try {
    const jobsCollection = await getJobsCollection();
    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime } = body;

    // Input validation
    if (!selectedDays?.length || !fromTime || !toTime || !everyTime) {
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

    return NextResponse.json({ message: "Job added successfully.", data: result }, { status: 201 });
  } catch (error) {
    console.error("Error adding job:", error);
    return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
  }
}

// GET: Fetch Jobs
export async function GET(req: Request) {
  try {
    const jobsCollection = await getJobsCollection();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const searchQuery = url.searchParams.get("search") || "";

    let filter = {};

    // Build filter based on query
    if (searchQuery) {
      const isActive = searchQuery.toLowerCase() === "active" ? true : searchQuery.toLowerCase() === "inactive" ? false : null;
      filter = isActive !== null ? { active: isActive } : { selectedDays: { $regex: searchQuery, $options: "i" } };
    }

    const [jobs, totalJobs] = await Promise.all([
      jobsCollection.find(filter).skip(skip).limit(limit).toArray(),
      jobsCollection.countDocuments(filter),
    ]);

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
    const jobsCollection = await getJobsCollection();
    const { id, active } = await req.json();

    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ObjectId format." }, { status: 400 });
    }

    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active } }
    );

    if (!result.matchedCount) {
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
