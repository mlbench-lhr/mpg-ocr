
// import { NextResponse } from 'next/server';
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";

// export async function POST(req: Request) {
//     try {
//         const data = await req.json();

//         // Validate incoming data
//         const requiredFields = [
//             "blNumber", "jobId", "pdfUrl", "carrier", "podDate", "podSignature", "totalQty",
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

//         // Extract and validate the jobId
//         const { jobId } = data;
//         if (!jobId) {
//             return NextResponse.json({ error: "jobId is missing" }, { status: 400 });
//         }

//         // Convert jobId to ObjectId
//         const client = await clientPromise;
//         const db = client.db("my-next-app");

//         // Fetch the job document based on jobId
//         const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });

//         if (!job) {
//             return NextResponse.json({ error: "Job not found for the provided jobId" }, { status: 404 });
//         }

//         // Add the jobName to the data
//         data.jobName = job.jobName;

//         // Add createdAt timestamp
//         const documentToInsert = {
//             ...data,
//             createdAt: new Date(),
//         };

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
import { ObjectId, WithId } from "mongodb";
import { Document } from 'bson';


export async function POST(req: Request) {
    try {
        const dataArray = await req.json();

        if (!Array.isArray(dataArray)) {
            return NextResponse.json({ error: "Input must be an array of objects" }, { status: 400 });
        }

        const requiredFields = [
            "blNumber", "jobId", "pdfUrl", "carrier", "podDate", "deliveryDate", "podSignature", "totalQty",
            "delivered", "damaged", "short", "over", "refused",
            "sealIntact", "finalStatus", "reviewStatus", "recognitionStatus", "breakdownReason", "reviewedBy", "cargoDescription"
        ];

        const client = await clientPromise;
        const db = client.db("my-next-app");

        const bulkOps = [];
        const jobIds = Array.from(new Set(dataArray.map(data => data.jobId).filter(jobId => !!jobId))).map(id => new ObjectId(id));

        const jobs = await db.collection("jobs").find({ _id: { $in: jobIds } }).toArray();
        const jobMap = jobs.reduce<Record<string, WithId<Document>>>((map, job) => {
            map[job._id.toString()] = job;
            return map;
        }, {});



        for (const data of dataArray) {
            for (const field of requiredFields) {
                if (!(field in data)) {
                    return NextResponse.json({ error: `${field} is missing in one of the objects` }, { status: 400 });
                }

                if (typeof data[field] === "string") {
                    data[field] = data[field].trim();
                }
            }

            const { jobId } = data;
            if (!jobId) {
                return NextResponse.json({ error: "jobId is missing in one of the objects" }, { status: 400 });
            }

            const job = jobMap[jobId];

            if (!job) {
                return NextResponse.json({ error: `Job not found for jobId: ${jobId}` }, { status: 404 });
            }

            data.jobName = job.jobName;

            bulkOps.push({
                insertOne: {
                    document: {
                        ...data,
                        createdAt: new Date(),
                        // updatedAt: new Date(),
                    },
                },
            });
        }

        if (bulkOps.length > 0) {
            const result = await db.collection("mockData").bulkWrite(bulkOps);
            return NextResponse.json({ message: "Data saved successfully", insertedCount: result.insertedCount }, { status: 200 });
        } else {
            return NextResponse.json({ error: "No valid data to save" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error saving mock data:", error);
        return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
    }
}
