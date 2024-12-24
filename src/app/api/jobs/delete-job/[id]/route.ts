import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid job ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("my-next-app");
    const jobsCollection = db.collection("jobs");

    const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully." }, { status: 200 });
  } catch (error) {
    console.log("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job." }, { status: 500 });
  }
}
