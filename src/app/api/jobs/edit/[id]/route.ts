import { MongoClient, ObjectId } from "mongodb";
import { NextResponse, NextRequest } from "next/server";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

// interface Params {
//   id: string;
// }

// export async function GET(req: Request, { params }: { params: Params }) {
  // const { id } = params; 


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 
    await client.connect();
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    // Find job by ID
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PATCH request handler for updating the job
// export async function PATCH(req: Request, { params }: { params: Params }) {
  // const { id } = params; 

export async function PATCH(req: NextRequest) {

  try {

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 
    // Parse the incoming JSON request body for the updated job details
    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime, active } = body;

    // Validate the input data
    if (!selectedDays || selectedDays.length === 0 || !fromTime || !toTime || !everyTime) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await client.connect();
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    // Update the job data in the database
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          selectedDays,
          fromTime,
          toTime,
          everyTime,
          active, // Update the active status (whether it's active or inactive)
          updatedAt: new Date(), // Track the update time
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated successfully." }); // Return success message
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  } finally {
    await client.close();
  }
}
