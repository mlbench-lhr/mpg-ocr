import { NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
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
    reviewedBy: string;
}

// Handle GET requests
export async function GET(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const dataCollection = db.collection<Job>("mockData");

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;
        const searchQuery = url.searchParams.get("search") || "";

        let filter: Filter<Job> = {};

        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" };
            filter = {
                $or: [
                    { blNumber: searchRegex },
                    { carrier: searchRegex },
                    { podSignature: searchRegex },
                ],
            };
        }

        const jobs = await dataCollection.find(filter).skip(skip).limit(limit).toArray();
        const totalJobs = await dataCollection.countDocuments(filter);

        return NextResponse.json(
            { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({ allowedMethods: ["GET"] });
}
