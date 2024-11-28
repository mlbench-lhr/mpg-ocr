import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

// Handle POST request to add a new job
export async function POST(req: Request) {
    try {
        // Parse the incoming JSON request body
        const body = await req.json();
        const { selectedDays, fromTime, toTime, everyTime } = body;

        // Validate the input
        if (!selectedDays || selectedDays.length === 0 || !fromTime || !toTime || !everyTime) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Connect to the MongoDB database
        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        // Insert the job data into the collection with "active" set to false by default
        const result = await jobsCollection.insertOne({
            selectedDays,
            fromTime,
            toTime,
            everyTime,
            active: false, // Default status is inactive
            createdAt: new Date(),
        });

        return NextResponse.json(
            { message: "Job added successfully.", data: result },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding job:", error);
        return NextResponse.json({ error: "Failed to add job." }, { status: 500 });
    } finally {
        await client.close();
    }
}

// Handle GET request to fetch all jobs (with pagination)
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = 1;
        const skip = (page - 1) * limit;

        // Connect to the MongoDB database
        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        // Fetch jobs with pagination (1 job per page)
        const jobs = await jobsCollection.find().skip(skip).limit(limit).toArray();
        const totalJobs = await jobsCollection.countDocuments();

        return NextResponse.json(
            { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
    } finally {
        await client.close();
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, active } = await req.json();

        // Validate input
        if (!id || typeof active !== "boolean") {
            return NextResponse.json({ error: "Invalid input." }, { status: 400 });
        }

        // Ensure the id is a valid ObjectId string
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ObjectId format." }, { status: 400 });
        }

        // Create a new ObjectId instance
        const objectId = new ObjectId(id);

        // Connect to the database
        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        // Update the job's status
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
    } finally {
        await client.close();
    }
}

// Handle OPTIONS request for allowed methods
export async function OPTIONS() {
    return NextResponse.json({ allowedMethods: ["POST", "GET", "PATCH"] });
}
