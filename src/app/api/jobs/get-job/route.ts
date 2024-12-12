import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// MongoDB Database Name
const DB_NAME = process.env.DB_NAME || "my-next-app";

async function getJobsCollection() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection("jobs");
}

export async function GET() {
    try {
        const jobsCollection = await getJobsCollection();
        const activeJobs = await jobsCollection.find({ active: true }).toArray();

        // Return the active jobs in JSON format
        return NextResponse.json({ activeJobs }, { status: 200 });

    } catch (error) {
        console.error('Error fetching active jobs:', error);

        // Return an error response in JSON format
        return NextResponse.json({ error: 'Failed to fetch active jobs.' }, { status: 500 });
    }
}
