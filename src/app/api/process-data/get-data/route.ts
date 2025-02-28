import { NextResponse } from "next/server";
import { Filter, ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { format, parse } from "date-fns";

interface Job {
    _id: ObjectId;
    blNumber: string;
    jobName: string;
    podDate: string;
    deliveryDate: Date;
    podSignature: string;
    totalQty: number;
    received: number;
    damaged: number;
    short: number;
    over: number;
    refused: number;
    noOfPages: number;
    stampExists: string;
    finalStatus: string;
    reviewStatus: string;
    recognitionStatus: string;
    breakdownReason: string;
    reviewedBy: string;
    cargoDescription: string;
    createdAt: string;
    updatedAt?: string;
}

const DB_NAME = process.env.DB_NAME || "my-next-app";


// export async function GET(req: Request) {
//     try {
//         const client = await clientPromise;
//         const db = client.db(DB_NAME);
//         const dataCollection = db.collection<Job>("mockData");

//         const url = new URL(req.url);
//         const page = parseInt(url.searchParams.get("page") || "1", 10);
//         const limit = parseInt(url.searchParams.get("limit") || "100", 10);
//         const skip = (page - 1) * limit;

//         const recognitionStatus = url.searchParams.get("recognitionStatus") || "";
//         const reviewStatus = url.searchParams.get("reviewStatus") || "";
//         const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
//         const breakdownReason = url.searchParams.get("breakdownReason") || "";

//         let podDate = url.searchParams.get("podDate") || "";
//         const podDateSignature = url.searchParams.get("podDateSignature") || "";
//         const bolNumber = url.searchParams.get("bolNumber") || "";
//         const jobName = url.searchParams.get("jobName") || "";
//         const searchQuery = url.searchParams.get("search") || "";

//         const filter: Filter<Job> = {};

//         if (podDateSignature) {
//             filter.podSignature = { $regex: podDateSignature.trim(), $options: "i" };
//         }
//         if (bolNumber) {
//             filter.blNumber = { $regex: bolNumber.trim(), $options: "i" };
//         }
//         if (jobName) {
//             filter.jobName = { $regex: jobName.trim(), $options: "i" };
//         }

//         if (searchQuery) {
//             const searchRegex = { $regex: searchQuery, $options: "i" };
//             filter.$or = [
//                 { blNumber: searchRegex },
//                 { jobName: searchRegex },
//                 { podSignature: searchRegex },
//             ];
//         }

//         if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
//         if (reviewStatus) filter.reviewStatus = reviewStatus;
//         if (reviewByStatus) filter.reviewedBy = reviewByStatus;
//         if (breakdownReason) filter.breakdownReason = breakdownReason;

//         if (podDate) {
//             try {
//                 const parsedDate = parse(podDate, "yyyy-MM-dd", new Date());
//                 podDate = format(parsedDate, "MM/dd/yy");
//                 filter.podDate = podDate;
//             } catch (error) {
//                 console.log("Invalid podDate format:", error);
//             }
//         }

//         const jobs = await dataCollection.find(filter).skip(skip).limit(limit).toArray();
//         const totalJobs = await dataCollection.countDocuments(filter);

//         return NextResponse.json(
//             { jobs, totalJobs, page, totalPages: Math.ceil(totalJobs / limit) },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.log("Error fetching jobs:", error);
//         return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
//     }
// }

// export async function OPTIONS() {
//     return NextResponse.json({ allowedMethods: ["GET"] });
// }

export async function GET(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const dataCollection = db.collection<Job>("mockData");

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        const recognitionStatus = url.searchParams.get("recognitionStatus") || "";
        const reviewStatus = url.searchParams.get("reviewStatus") || "";
        const reviewByStatus = url.searchParams.get("reviewByStatus") || "";
        const breakdownReason = url.searchParams.get("breakdownReason") || "";

        let podDate = url.searchParams.get("podDate") || "";
        const podDateSignature = url.searchParams.get("podDateSignature") || "";
        const bolNumber = url.searchParams.get("bolNumber") || "";
        const jobName = url.searchParams.get("jobName") || "";
        const searchQuery = url.searchParams.get("search") || "";

        const sortColumn = url.searchParams.get("sortColumn") || "";
        const sortOrder = url.searchParams.get("sortOrder") === "desc" ? -1 : 1;

        const filter: Filter<Job> = {};
        let sortQuery: Record<string, 1 | -1> = {};

        if (sortColumn === "all") {
            const sortableFields = [
                "blNumber", "podDate", "podSignature", "totalQty", "received",
                "damaged", "short", "over", "refused", "customerOrderNum",
                "stampExists", "finalStatus", "reviewStatus", "recognitionStatus",
                "breakdownReason", "reviewedBy", "jobName"
            ];

            sortableFields.forEach((field) => {
                sortQuery[field] = sortOrder;
            });
        } else if (sortColumn) {
            sortQuery = { [sortColumn]: sortOrder };
        }

        //  let sortQuery = {};
        //  if (sortColumn) {
        //      sortQuery = { [sortColumn]: sortOrder };
        //  }

        if (podDateSignature) {
            filter.podSignature = { $regex: podDateSignature.trim(), $options: "i" };
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
                { jobName: searchRegex },
                { podSignature: searchRegex },
            ];
        }

        if (recognitionStatus) filter.recognitionStatus = recognitionStatus;
        if (reviewStatus) filter.reviewStatus = reviewStatus;
        if (reviewByStatus) filter.reviewedBy = reviewByStatus;
        if (breakdownReason) filter.breakdownReason = breakdownReason;

        if (podDate) {
            try {
                const parsedDate = parse(podDate, "yyyy-MM-dd", new Date());
                podDate = format(parsedDate, "MM/dd/yy");
                filter.podDate = podDate;
            } catch (error) {
                console.log("Invalid podDate format:", error);
            }
        }

        const jobs = await dataCollection.find(filter).sort(sortQuery).skip(skip).limit(limit).toArray();
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