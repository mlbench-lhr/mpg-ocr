import { NextResponse, NextRequest } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB client initialization
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");


// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
// const { id } = params;

export async function DELETE(req: NextRequest) {

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop(); // Extract the `id`

        // Validate ID
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid job ID." }, { status: 400 });
        }

        // Connect to the MongoDB database
        await client.connect();
        const db = client.db("my-next-app");
        const jobsCollection = db.collection("jobs");

        // Delete the job from the collection
        const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Job not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Job deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Failed to delete job." }, { status: 500 });
    } finally {
        await client.close();
    }
}
