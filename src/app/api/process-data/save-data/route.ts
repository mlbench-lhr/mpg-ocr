import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Validate incoming data
        const requiredFields = [
            "blNumber", "carrier", "podDate", "podSignature", "totalQty",
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

        // Add createdAt timestamp
        const documentToInsert = {
            ...data,
            createdAt: new Date(),
        };

        // Connect to the database
        const client = await clientPromise;
        const db = client.db("my-next-app");

        // Insert data into the "mockData" collection
        const result = await db.collection("mockData").insertOne(documentToInsert);

        // Return the result of the insertion
        return NextResponse.json({ message: "Data saved successfully", insertedId: result.insertedId }, { status: 200 });
    } catch (error) {
        console.error("Error saving mock data:", error);
        return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
    }
}
