// import { NextResponse } from "next/server";
// import { ObjectId, WithId } from "mongodb";
// import { Document } from "bson";
import clientPromise from "@/lib/mongodb";

export async function saveProcessedDataToDB(processedDataArray) {
    try {
        const client = await clientPromise;
        const db = client.db("my-next-app");

        // Bulk insert data into MongoDB
        const bulkOps = [];
        for (const data of processedDataArray) {
            bulkOps.push({
                insertOne: {
                    document: {
                        ...data,
                        createdAt: new Date(),
                    },
                },
            });
        }

        if (bulkOps.length > 0) {
            const result = await db.collection("mockData").bulkWrite(bulkOps);
            console.log("Data saved successfully:", result.insertedCount);
            return result;
        } else {
            throw new Error("No valid data to save");
        }
    } catch (error) {
        console.error("Error saving OCR data:", error);
        throw new Error("Failed to save processed data to DB");
    }
}
