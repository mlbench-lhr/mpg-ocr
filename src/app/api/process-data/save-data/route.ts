// import { NextResponse } from 'next/server';
// import clientPromise from "@/lib/mongodb";

// export async function POST(req: Request) {
//     try {
//         const data = await req.json();

//         // Validate incoming data
//         const requiredFields = [
//             "blNumber", "jobName", "carrier", "podDate", "podSignature", "totalQty",
//             "delivered", "damaged", "short", "over", "refused",
//             "sealIntact", "finalStatus", "reviewStatus", "recognitionStatus", "breakdownReason", "reviewedBy", "cargoDescription"
//         ];

//         for (const field of requiredFields) {
//             if (!(field in data)) {
//                 return NextResponse.json({ error: `${field} is missing` }, { status: 400 });
//             }

//             // Trim string fields
//             if (typeof data[field] === "string") {
//                 data[field] = data[field].trim();
//             }
//         }

//         // Add createdAt timestamp
//         const documentToInsert = {
//             ...data,
//             createdAt: new Date(),
//         };

//         // Connect to the database
//         const client = await clientPromise;
//         const db = client.db("my-next-app");

//         // Insert data into the "mockData" collection
//         const result = await db.collection("mockData").insertOne(documentToInsert);

//         // Return the result of the insertion
//         return NextResponse.json({ message: "Data saved successfully", insertedId: result.insertedId }, { status: 200 });
//     } catch (error) {
//         console.error("Error saving mock data:", error);
//         return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // Import for ObjectId conversion

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Validate incoming data
        const requiredFields = [
            "blNumber", "jobId", "pdfUrl", "carrier", "podDate", "podSignature", "totalQty",
            "delivered", "damaged", "short", "over", "refused",
            "sealIntact", "finalStatus", "reviewStatus", "recognitionStatus", "breakdownReason", "reviewedBy", "cargoDescription"
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                return NextResponse.json({ error: `${field} is missing` }, { status: 400 });
            }

            // Trim string fields
            if (typeof data[field] === "string") {
                data[field] = data[field].trim();
            }
        }

        // Extract and validate the jobId
        const { jobId } = data;
        if (!jobId) {
            return NextResponse.json({ error: "jobId is missing" }, { status: 400 });
        }

        // Convert jobId to ObjectId
        const client = await clientPromise;
        const db = client.db("my-next-app");

        // Fetch the job document based on jobId
        const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });

        if (!job) {
            return NextResponse.json({ error: "Job not found for the provided jobId" }, { status: 404 });
        }

        // Add the jobName to the data
        data.jobName = job.jobName;

        // Add createdAt timestamp
        const documentToInsert = {
            ...data,
            createdAt: new Date(),
        };

        // Insert data into the "mockData" collection
        const result = await db.collection("mockData").insertOne(documentToInsert);

        // Return the result of the insertion
        return NextResponse.json({ message: "Data saved successfully", insertedId: result.insertedId }, { status: 200 });
    } catch (error) {
        console.error("Error saving mock data:", error);
        return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
    }
}
