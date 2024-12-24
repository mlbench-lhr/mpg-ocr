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
}

export async function GET(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        const dataCollection = db.collection<Job>("mockData");

        const url = new URL(req.url);

        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        const recognitionStatus = url.searchParams.get("recognitionStatus") || "";
        const reviewStatus = url.searchParams.get("reviewStatus") || "";
        const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
        const breakdownReason = url.searchParams.get("breakdownReason") || "";
        const podDate = url.searchParams.get("podDate") || "";
        const podDateSignature = url.searchParams.get("podDateSignature") || "";
        const carrier = url.searchParams.get("carrier") || "";
        const bolNumber = url.searchParams.get("bolNumber") || "";
        const jobName = url.searchParams.get("jobName") || "";
        const searchQuery = url.searchParams.get("search") || "";

        const filter: Filter<Job> = {};

        if (podDateSignature) {
            filter.podSignature = { $regex: podDateSignature.trim(), $options: "i" };
        }
        if (carrier) {
            filter.carrier = { $regex: carrier.trim(), $options: "i" };
        }
        if (bolNumber) {
            filter.blNumber = { $regex: bolNumber.trim(), $options: "i" };
        }
        if (jobName) {
            filter.jobName = { $regex: jobName.trim(), $options: "i" };
        }

        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" };
            filter.$or = [
                { blNumber: searchRegex },
                { carrier: searchRegex },
                { podSignature: searchRegex },
                { jobName: searchRegex },
            ];
        }

        if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
        if (reviewStatus) filter.reviewStatus = reviewStatus;
        if (reviewByStatus) filter.reviewedBy = reviewByStatus;
        if (breakdownReason) filter.breakdownReason = breakdownReason;
        if (podDate) filter.podDate = podDate;

        const jobs = await dataCollection.find(filter).skip(skip).limit(limit).toArray();
        const totalJobs = await dataCollection.countDocuments(filter);

        return NextResponse.json(
            { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({ allowedMethods: ["GET"] });
}
