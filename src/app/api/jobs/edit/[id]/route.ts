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

// export async function PATCH(req: Request, { params }: { params: Params }) {
// const { id } = params; 

export async function PATCH(req: NextRequest) {

  try {

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 
    const body = await req.json();
    const { selectedDays, fromTime, toTime, everyTime, active } = body;

    if (!selectedDays || selectedDays.length === 0 || !fromTime || !toTime || !everyTime) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await client.connect();
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          selectedDays,
          fromTime,
          toTime,
          everyTime,
          active,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated successfully." });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  } finally {
    await client.close();
  }
}
