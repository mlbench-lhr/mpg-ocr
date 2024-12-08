import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    // Validate job ID
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid job ID." }, { status: 400 });
    }

    // Get the MongoDB client and database
    const client = await clientPromise;
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    // Delete the job
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });

    // Handle cases where the job doesn't exist
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job." }, { status: 500 });
  }
}
