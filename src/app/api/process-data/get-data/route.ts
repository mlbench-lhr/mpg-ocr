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
    noOfPages: number;
    sealIntact: string;
    finalStatus: string;
    reviewStatus: string;
    recognitionStatus: string;
    breakdownReason: string;
    reviewedBy: string;
    cargoDescription: string;
    receiverSignature: string;
}

// Handle GET requests
export async function GET(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const dataCollection = db.collection<Job>("mockData");

        const url = new URL(req.url);

        // Pagination
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        // Filters
        const searchQuery = url.searchParams.get("search") || "";
        const finalStatus = url.searchParams.get("finalStatus") || "";
        const reviewStatus = url.searchParams.get("reviewStatus") || "";
        const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
        const podDate = url.searchParams.get("podDate") || "";
        const podDateSignature = url.searchParams.get("podDateSignature") || "";
        const carrier = url.searchParams.get("carrier") || "";
        const bolNumber = url.searchParams.get("bolNumber") || "";

        const filter: Filter<Job> = {};

        // Dynamic filters
        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" };
            filter.$or = [
                { blNumber: searchRegex },
                { carrier: searchRegex },
                { podSignature: searchRegex },
            ];
        }
        if (finalStatus) filter.recognitionStatus = finalStatus;
        if (reviewStatus) filter.reviewStatus = reviewStatus;
        if (reviewByStatus) filter.reviewedBy = reviewByStatus;
        if (podDate) filter.podDate = podDate;
        if (podDateSignature) filter.podSignature = podDateSignature;
        if (carrier) filter.carrier = carrier;
        if (bolNumber) filter.blNumber = bolNumber;

        // Fetch data from MongoDB
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
