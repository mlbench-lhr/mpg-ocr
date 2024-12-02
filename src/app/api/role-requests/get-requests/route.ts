import { NextResponse } from "next/server";
import { Filter } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface User {
    name?: string;
    email?: string;
}

export async function GET(req: Request) {
    try {

        const client = await clientPromise;
        const db = client.db("my-next-app");

        const usersCollection = db.collection("users");

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;
        const searchQuery = url.searchParams.get("search") || "";

        // Base filter: fetch users with status 0 or 2
        let filter: Filter<User> = { status: { $in: [0, 1, 2] } };

        // Add search functionality for name or email
        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
            filter = {
                ...filter,
                $or: [
                    { name: searchRegex }, // Match name
                    { email: searchRegex }, // Match email
                    { role: searchRegex }, // Match email

                ],
            };
        }

        // Fetch users with the applied filters
        const users = await usersCollection.find(filter).skip(skip).limit(limit).toArray();
        const totalUsers = await usersCollection.countDocuments(filter);

        // Return response with users and pagination info
        return NextResponse.json(
            { users, totalUsers, page, totalPages: Math.ceil(totalUsers / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
    }
}

// OPTIONS: Define Allowed Methods
export async function OPTIONS() {
    return NextResponse.json({ allowedMethods: ["GET"] });
}
