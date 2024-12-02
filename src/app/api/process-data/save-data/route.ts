import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";


// export async function POST(req) {
export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Validate incoming data
        const requiredFields = [
            "blNumber", "carrier", "podDate", "podSignature", "totalQty",
            "delivered", "damaged", "short", "over", "refused",
            "sealIntact", "finalStatus", "reviewStatus", "recognitionStatus", "reviewedBy"
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                return NextResponse.json({ error: `${field} is missing` }, { status: 400 });
            }
        }

        // Connect to the database
        // const { db } = await connectToDatabase();
        const client = await clientPromise;
        const db = client.db("my-next-app");

        // Insert data into the "mockData" collection
        const result = await db.collection("mockData").insertOne(data);

        // Return the result of the insertion
        return NextResponse.json({ message: "data saved successfully", insertedId: result.insertedId }, { status: 200 });
    } catch (error) {
        console.error("Error saving mock data:", error);
        return NextResponse.json({ error: "Failed to save mock data" }, { status: 500 });
    }
}
