import { NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface Job {
    _id: ObjectId;
    blNumber: string;
    jobName: string;
    carrier: string;
    podDate: string;
    deliveryDate: string;
    podSignature: string;
    totalQty: number;
    delivered: number;
    damaged: number;
    short: number;
    over: number;
    refused: number;
    noOfPages: number;
    sealIntact: string;
    finalStatus: string;
    reviewStatus: string;
    recognitionStatus: string;
    breakdownReason: string;
    reviewedBy: string;
    cargoDescription: string;
    receiverSignature: string;
    createdAt: string;
    updatedAt?: string; // Optional since not all documents might have it
}

export async function GET(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const dataCollection = db.collection<Job>("mockData");

        const url = new URL(req.url);

        // Pagination
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);  
        const skip = (page - 1) * limit;

        // Filters
        const searchQuery = url.searchParams.get("search") || "";

        const filter: Filter<Job> = {
            $or: [
                { updatedAt: { $exists: true } },
                { $expr: { $gt: ["$updatedAt", "$createdAt"] } },
            ],
        };

        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" };

            // Apply search query to specific fields (blNumber, recognitionStatus)
            filter.$and = [
                ...(filter.$and || []),
                {
                    $or: [
                        { blNumber: searchRegex },
                        { recognitionStatus: searchRegex }
                    ]
                }
            ];
        }

        // Fetch total count of matching documents (for pagination)
        const totalJobs = await dataCollection.countDocuments(filter);

        // Fetch filtered data with pagination
        const jobs = await dataCollection.find(filter).skip(skip).limit(limit).toArray();

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
