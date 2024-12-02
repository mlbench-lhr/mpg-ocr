import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";


export async function POST(req: Request) {
    try {
        const { userId, status } = await req.json();

        if (!userId || typeof status !== "number") {
            return NextResponse.json(
                { error: "Invalid parameters" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("my-next-app");
        const usersCollection = db.collection("users");

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Status updated successfully", result },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating user status:", error);
        return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
        );
    }
}
